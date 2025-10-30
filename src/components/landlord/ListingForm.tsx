'use client';

import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { Check, ChevronsUpDown, Loader2 } from 'lucide-react';
import type { Apartment } from '@/lib/types';
import { useFirestore, useUser } from '@/firebase';
import { addDoc, collection, doc, serverTimestamp, setDoc, updateDoc } from 'firebase/firestore';
import { PlaceHolderImages, ImagePlaceholder } from '@/lib/placeholder-images';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '../ui/command';
import { cn } from '@/lib/utils';
import Image from 'next/image';

const formSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters.'),
  description: z.string().min(20, 'Description must be at least 20 characters.'),
  address: z.string().min(10, 'Please enter a full address.'),
  price: z.coerce.number().min(1, 'Price must be greater than 0.'),
  bedrooms: z.coerce.number().min(0, 'Number of bedrooms cannot be negative.'),
  bathrooms: z.coerce.number().min(0.5, 'Number of bathrooms cannot be less than 0.5.'),
  availabilityDate: z.string().min(1, 'Please select an availability date.'),
  amenities: z.string().min(1, 'List at least one amenity.'),
  photos: z.array(z.object({ id: z.string(), imageUrl: z.string(), imageHint: z.string(), description: z.string() })).min(1, "Please select at least one photo.").max(5, "You can select up to 5 photos."),
});

interface ListingFormProps {
  apartment?: Apartment;
}

export default function ListingForm({ apartment }: ListingFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const firestore = useFirestore();
  const { user } = useUser();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: apartment?.title || '',
      description: apartment?.description || '',
      address: apartment?.location?.address || '',
      price: apartment?.price || 0,
      bedrooms: apartment?.bedrooms || 0,
      bathrooms: apartment?.bathrooms || 0,
      availabilityDate: apartment?.availabilityDate ? new Date(apartment.availabilityDate).toISOString().split('T')[0] : '',
      amenities: apartment?.amenities?.join(', ') || '',
      photos: apartment?.photos || [],
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    if (!firestore || !user) {
        toast({ title: "Error", description: "You must be logged in to manage listings.", variant: "destructive" });
        setIsLoading(false);
        return;
    }

    const listingData = {
        landlordId: user.uid,
        title: values.title,
        description: values.description,
        location: {
            address: values.address,
            // In a real app, you'd get lat/lng from a geocoding service
            lat: 37.7749 + (Math.random() - 0.5) * 0.1,
            lng: -122.4194 + (Math.random() - 0.5) * 0.1,
        },
        price: values.price,
        bedrooms: values.bedrooms,
        bathrooms: values.bathrooms,
        availabilityDate: values.availabilityDate,
        amenities: values.amenities.split(',').map(a => a.trim()).filter(Boolean),
        photos: values.photos,
        updatedAt: serverTimestamp(),
    };

    try {
        if (apartment?.id) {
            // Update existing listing
            const apartmentRef = doc(firestore, 'apartments', apartment.id);
            await updateDoc(apartmentRef, listingData);
            toast({
                title: 'Listing Updated',
                description: `Your apartment "${values.title}" has been successfully saved.`,
            });
        } else {
            // Create new listing
            const collectionRef = collection(firestore, 'apartments');
            const docRef = await addDoc(collectionRef, {
                ...listingData,
                createdAt: serverTimestamp(),
            });
            toast({
                title: 'Listing Created',
                description: `Your apartment "${values.title}" has been successfully listed.`,
            });
        }
        router.push('/dashboard/landlord/listings');
        router.refresh(); // Refresh to show new data
    } catch (error) {
        console.error("Error writing to Firestore:", error);
        toast({ title: "Error", description: "Failed to save the listing.", variant: "destructive" });
    } finally {
        setIsLoading(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 max-w-3xl">
        
        <FormField
          control={form.control}
          name="photos"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Photos</FormLabel>
              <FormControl>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      className="w-full justify-between h-auto"
                    >
                      <div className="flex flex-wrap gap-2">
                        {field.value.length > 0 ? (
                           field.value.map(photo => (
                            <div key={photo.id} className="p-1 border rounded-md">
                                <Image src={photo.imageUrl} alt={photo.description} width={48} height={48} className="object-cover rounded-md h-12 w-12"/>
                            </div>
                           ))
                        ) : "Select up to 5 photos..."}
                      </div>
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[400px] p-0">
                    <Command>
                      <CommandInput placeholder="Search images..." />
                       <CommandList>
                        <CommandEmpty>No images found.</CommandEmpty>
                        <CommandGroup>
                          {PlaceHolderImages.map((image) => (
                            <CommandItem
                              key={image.id}
                              value={image.id}
                              onSelect={() => {
                                const currentValue = form.getValues("photos");
                                const isSelected = currentValue.some(p => p.id === image.id);
                                if (isSelected) {
                                  form.setValue("photos", currentValue.filter(p => p.id !== image.id));
                                } else if (currentValue.length < 5) {
                                  form.setValue("photos", [...currentValue, image]);
                                } else {
                                  toast({ variant: 'destructive', title: "Limit Reached", description: "You can only select up to 5 images." });
                                }
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  field.value.some(p => p.id === image.id) ? "opacity-100" : "opacity-0"
                                )}
                              />
                                <div className='flex items-center gap-2'>
                                   <Image src={image.imageUrl} alt={image.description} width={32} height={32} className="object-cover rounded-sm h-8 w-8"/>
                                    <span className='line-clamp-1'>{image.description}</span>
                                </div>
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />


        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Listing Title</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Sunny 2-Bedroom in Downtown" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea placeholder="Describe your apartment in detail..." {...field} rows={5} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="address"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Full Address</FormLabel>
              <FormControl>
                <Input placeholder="123 Main St, San Francisco, CA 94105" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <FormField
            control={form.control}
            name="price"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Price (per month)</FormLabel>
                <FormControl>
                    <Input type="number" placeholder="3200" {...field} />
                </FormControl>
                <FormMessage />
                </FormItem>
            )}
            />
            <FormField
            control={form.control}
            name="availabilityDate"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Availability Date</FormLabel>
                <FormControl>
                    <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
                </FormItem>
            )}
            />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <FormField
            control={form.control}
            name="bedrooms"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Bedrooms</FormLabel>
                <FormControl>
                    <Input type="number" min="0" step="1" placeholder="2" {...field} />
                </FormControl>
                <FormMessage />
                </FormItem>
            )}
            />
             <FormField
            control={form.control}
            name="bathrooms"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Bathrooms</FormLabel>
                <FormControl>
                    <Input type="number" min="0" step="0.5" placeholder="2" {...field} />
                </FormControl>
                <FormMessage />
                </FormItem>
            )}
            />
        </div>

        <FormField
          control={form.control}
          name="amenities"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Amenities</FormLabel>
              <FormControl>
                <Input placeholder="In-unit washer/dryer, Gym, Rooftop deck, Parking" {...field} />
              </FormControl>
              <p className="text-sm text-muted-foreground">Separate amenities with a comma.</p>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" size="lg" disabled={isLoading} style={{ backgroundColor: 'hsl(var(--accent))', color: 'hsl(var(--accent-foreground))' }}>
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {apartment ? 'Save Changes' : 'Create Listing'}
        </Button>
      </form>
    </Form>
  );
}

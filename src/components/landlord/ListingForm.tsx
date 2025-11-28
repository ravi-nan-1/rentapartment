'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import type { Apartment } from '@/lib/types';
import { useAuth } from '@/hooks/useAuth';
import apiFetch from '@/lib/api';

const formSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters.'),
  description: z.string().min(20, 'Description must be at least 20 characters.'),
  address: z.string().min(10, 'Please enter a full address.'),
  price: z.coerce.number().min(1, 'Price must be greater than 0.'),
  bedrooms: z.coerce.number().min(0, 'Number of bedrooms cannot be negative.'),
  bathrooms: z.coerce.number().min(0.5, 'Number of bathrooms cannot be less than 0.5.'),
  availability_date: z.string().min(1, 'Please select an availability date.'),
  amenities: z.string().min(1, 'List at least one amenity.'),
});

interface ListingFormProps {
  apartment?: Apartment;
}

export default function ListingForm({ apartment }: ListingFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: apartment?.title || '',
      description: apartment?.description || '',
      address: apartment?.address || '',
      price: apartment?.price || 0,
      bedrooms: apartment?.bedrooms || 0,
      bathrooms: apartment?.bathrooms || 0,
      availability_date: apartment?.availability_date ? new Date(apartment.availability_date).toISOString().split('T')[0] : '',
      amenities: apartment?.amenities?.join(', ') || '',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    if (!user) {
        toast({ title: "Error", description: "You must be logged in to manage listings.", variant: "destructive" });
        setIsLoading(false);
        return;
    }

    const listingData = {
        ...values,
        amenities: values.amenities.split(',').map(a => a.trim()).filter(Boolean),
    };

    try {
        if (apartment?.id) {
            // Update existing listing
            await apiFetch(`/apartments/${apartment.id}`, {
                method: 'PATCH',
                body: JSON.stringify(listingData),
            });
            toast({
                title: 'Listing Updated',
                description: `Your apartment "${values.title}" has been successfully saved.`,
            });
        } else {
            // Create new listing
            await apiFetch('/apartments', {
                method: 'POST',
                body: JSON.stringify(listingData),
            });
            toast({
                title: 'Listing Created',
                description: `Your apartment "${values.title}" has been successfully listed.`,
            });
        }
        router.push('/dashboard/landlord/listings');
        router.refresh(); // Refresh to show new data
    } catch (error) {
        console.error("Error writing to API:", error);
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
            name="availability_date"
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

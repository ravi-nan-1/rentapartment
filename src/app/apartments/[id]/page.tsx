'use client';

import Image from 'next/image';
import { useRouter, useParams, notFound } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { IndianRupee, Calendar, BedDouble, Bath, MapPin, CheckCircle, MessageSquare, Heart, Star } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { Skeleton } from '@/components/ui/skeleton';
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import LandlordReviews from '@/components/reviews/LandlordReviews';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import ReviewForm from '@/components/reviews/ReviewForm';
import apiFetch from '@/lib/api';
import type { Apartment, User as LandlordUser } from '@/lib/types';


function ApartmentDetailLoading() {
    return (
        <div className="container mx-auto px-4 py-8">
            <div className="grid md:grid-cols-3 gap-8">
                <div className="md:col-span-2">
                    <Skeleton className="w-full h-96 rounded-lg" />
                    <Card className="mt-8">
                        <CardHeader>
                             <Skeleton className="h-8 w-3/4" />
                        </CardHeader>
                        <CardContent>
                            <Skeleton className="h-5 w-1/2 mb-4" />
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-full mt-2" />
                            <Skeleton className="h-4 w-5/6 mt-2" />
                        </CardContent>
                    </Card>
                </div>
                <div className="space-y-8">
                     <Skeleton className="w-full h-80 rounded-lg" />
                     <Skeleton className="w-full h-32 rounded-lg" />
                </div>
            </div>
        </div>
    )
}

export default function ApartmentDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const { user, loading: userLoading, reloadUser } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const [apartment, setApartment] = useState<Apartment | null>(null);
  const [landlord, setLandlord] = useState<LandlordUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    const fetchApartmentData = async () => {
        try {
            setLoading(true);
            const apartmentData = await apiFetch(`/apartments/${id}`);
            setApartment(apartmentData);

            if (apartmentData.landlord_id) {
                // This assumes an endpoint to get user by id exists.
                // If not, this might need adjustment.
                // For now, we'll try to fetch, but handle errors gracefully.
                 try {
                     const landlordData = await apiFetch(`/users/${apartmentData.landlord_id}`);
                     setLandlord(landlordData);
                 } catch (e) {
                     console.warn("Could not fetch landlord public data:", e);
                     setLandlord({ id: apartmentData.landlord_id, name: 'Landlord', email: '', role: 'landlord' });
                 }
            }
        } catch (error) {
            console.error("Failed to fetch apartment data:", error);
            // This will trigger the notFound() UI
            setApartment(null);
        } finally {
            setLoading(false);
        }
    };
    fetchApartmentData();
  }, [id]);

  const isLandlord = user && landlord && user.id === landlord.id;
  const isFavorited = user?.favorite_apartment_ids?.includes(id);

  const handleFavoriteClick = async () => {
    if (!user) {
      toast({
        variant: "destructive",
        title: "Not Logged In",
        description: "You must be logged in to favorite apartments.",
      });
      return;
    }
    
    try {
      if (isFavorited) {
        await apiFetch(`/favorites/${id}`, { method: 'DELETE' });
        toast({ title: "Removed from Favorites" });
      } else {
        await apiFetch(`/favorites/${id}`, { method: 'POST' });
        toast({ title: "Added to Favorites" });
      }
      await reloadUser();
    } catch (error) {
      console.error("Error updating favorites:", error);
      toast({ variant: 'destructive', title: "Error", description: "Could not update favorites." });
    }
  };

  const handleStartChat = async () => {
    if (!user || !apartment || !landlord) {
      router.push('/login');
      return;
    }

    if (isLandlord) {
        return;
    }

    try {
        const chat = await apiFetch('/chats', {
            method: 'POST',
            body: JSON.stringify({
                apartment_id: apartment.id,
                participant_id: landlord.id
            }),
        });
        router.push(`/dashboard/messages/${chat.id}`);
    } catch (error: any) {
        // If a chat already exists, the backend might return a 409 Conflict with the existing chat ID
        if (error.detail && error.detail.existing_chat_id) {
             router.push(`/dashboard/messages/${error.detail.existing_chat_id}`);
        } else {
            console.error('Error creating or fetching chat:', error);
            toast({
                variant: 'destructive',
                title: 'Error',
                description: 'Could not start a conversation.',
            });
        }
    }
  };

  if (loading) {
    return <ApartmentDetailLoading />;
  }
  
  if (!apartment) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
          <Carousel className="w-full rounded-lg overflow-hidden border">
            <CarouselContent>
              {(apartment.photos && apartment.photos.length > 0) ? apartment.photos.map((photo, index) => (
                <CarouselItem key={index}>
                  <div className="relative w-full h-96">
                    <Image
                      src={photo.url}
                      alt={`${apartment.title} - photo ${index + 1}`}
                      fill
                      className="object-cover"
                      data-ai-hint={photo.hint}
                      priority={index === 0}
                    />
                  </div>
                </CarouselItem>
              )) : (
                 <CarouselItem>
                  <div className="relative w-full h-96 bg-muted flex items-center justify-center">
                    <p className='text-muted-foreground'>No images available</p>
                  </div>
                </CarouselItem>
              )}
            </CarouselContent>
            <CarouselPrevious className="ml-16" />
            <CarouselNext className="mr-16" />
          </Carousel>
          
          <Card className="mt-8">
            <CardHeader>
              <CardTitle className="text-3xl">{apartment.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center text-muted-foreground mb-4">
                <MapPin className="mr-2 h-4 w-4" />
                <span>{apartment.address}</span>
              </div>
              <p className="text-base">{apartment.description}</p>
            </CardContent>
          </Card>

          <Card className="mt-8">
            <CardHeader>
                <CardTitle>Amenities</CardTitle>
            </CardHeader>
            <CardContent>
                <ul className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                    {apartment.amenities.map(amenity => (
                        <li key={amenity} className="flex items-center">
                            <CheckCircle className="h-4 w-4 mr-2 text-primary" />
                            <span>{amenity}</span>
                        </li>
                    ))}
                </ul>
            </CardContent>
          </Card>

          {landlord && <LandlordReviews landlordId={landlord.id} />}

        </div>
        <div className="space-y-8">
            <Card>
                <CardHeader>
                    <CardTitle className="text-2xl">Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center text-3xl font-bold">
                        <IndianRupee className="mr-2 h-7 w-7 text-muted-foreground" />
                        <span>₹{apartment.price.toLocaleString()} <span className="text-lg font-normal text-muted-foreground">/ month</span></span>
                    </div>
                     <Separator />
                    <div className="flex items-center text-lg">
                        <BedDouble className="mr-3 h-5 w-5 text-muted-foreground" />
                        <span>{apartment.bedrooms} Bedroom{apartment.bedrooms !== 1 ? 's' : ''}</span>
                    </div>
                    <div className="flex items-center text-lg">
                        <Bath className="mr-3 h-5 w-5 text-muted-foreground" />
                        <span>{apartment.bathrooms} Bathroom{apartment.bathrooms !== 1 ? 's' : ''}</span>
                    </div>
                     <div className="flex items-center text-lg">
                        <Calendar className="mr-3 h-5 w-5 text-muted-foreground" />
                        <span>Available: {new Date(apartment.availability_date).toLocaleDateString() !== 'Invalid Date' ? new Date(apartment.availability_date).toLocaleDateString() : apartment.availability_date}</span>
                    </div>
                    <Separator />
                    <div className="flex items-center gap-2">
                        <Button size="lg" className="w-full text-lg" onClick={handleStartChat} style={{ backgroundColor: 'hsl(var(--accent))', color: 'hsl(var(--accent-foreground))' }} disabled={isLandlord}>
                            <MessageSquare className="mr-2 h-5 w-5" />
                            {isLandlord ? "This is your listing" : "Message Landlord"}
                        </Button>
                        {user && (
                            <Button size="lg" variant="outline" onClick={handleFavoriteClick} className="px-3">
                               <Heart className={cn("h-5 w-5", isFavorited ? "text-red-500 fill-red-500" : "text-muted-foreground")} />
                            </Button>
                        )}
                    </div>
                </CardContent>
            </Card>

            {landlord && (
                <Card>
                    <CardHeader>
                        <CardTitle>About the Landlord</CardTitle>
                    </CardHeader>
                    <CardContent className="flex items-center space-x-4">
                        <Avatar className="h-16 w-16">
                            <AvatarImage src={landlord.profile_picture_url} alt={landlord.name} />
                            <AvatarFallback>{landlord.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                            <p className="font-semibold">{landlord.name}</p>
                             <p className="text-sm text-muted-foreground">Member since 2023</p>
                        </div>
                    </CardContent>
                </Card>
            )}

            {apartment.conditions && (
                <Card>
                    <CardHeader>
                        <CardTitle>Conditions</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm">{apartment.conditions}</p>
                    </CardContent>
                </Card>
            )}

            {landlord && user && !isLandlord && (
              <Dialog>
                <DialogTrigger asChild>
                   <Button variant="outline" className="w-full">
                      <Star className="mr-2 h-4 w-4" />
                      Leave a Review
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Review {landlord.name}</DialogTitle>
                  </DialogHeader>
                  <ReviewForm landlordId={landlord.id} userId={user.id} />
                </DialogContent>
              </Dialog>
            )}

        </div>
      </div>
    </div>
  );
}

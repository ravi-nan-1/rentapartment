'use client';

import Image from 'next/image';
import { notFound, useRouter, useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { DollarSign, Calendar, BedDouble, Bath, MapPin, CheckCircle, MessageSquare, Heart, Star } from 'lucide-react';
import { useFirestore, useUser } from '@/firebase';
import { useDoc } from '@/firebase/firestore/use-doc';
import { useCollection } from '@/firebase/firestore/use-collection';
import { doc, collection, query, where, getDocs, addDoc, serverTimestamp, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';
import { useState, useMemo } from 'react';
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
  const firestore = useFirestore();
  const { user, loading: userLoading } = useUser();
  const router = useRouter();
  const { toast } = useToast();

  const apartmentRef = useMemo(() => firestore ? doc(firestore, 'apartments', id) : null, [firestore, id]);
  const { data: apartment, loading: apartmentLoading } = useDoc(apartmentRef);

  const landlordRef = useMemo(() => firestore && apartment?.landlordId ? doc(firestore, 'users', apartment.landlordId) : null, [firestore, apartment]);
  const { data: landlord, loading: landlordLoading } = useDoc(landlordRef);

  const userProfileRef = useMemo(() => user && firestore ? doc(firestore, 'users', user.uid) : null, [user, firestore]);
  const { data: userProfile } = useDoc(userProfileRef);
  
  const loading = apartmentLoading || landlordLoading || userLoading;

  const isLandlord = user && landlord && user.uid === landlord.id;
  const isFavorited = userProfile?.favoriteApartmentIds?.includes(id);

  const handleFavoriteClick = async () => {
    if (!userProfile || !firestore) {
      toast({
        variant: "destructive",
        title: "Not Logged In",
        description: "You must be logged in to favorite apartments.",
      });
      return;
    }

    const userRef = doc(firestore, 'users', user.uid);
    try {
      if (isFavorited) {
        await updateDoc(userRef, {
          favoriteApartmentIds: arrayRemove(id)
        });
        toast({ title: "Removed from Favorites" });
      } else {
        await updateDoc(userRef, {
          favoriteApartmentIds: arrayUnion(id)
        });
        toast({ title: "Added to Favorites" });
      }
    } catch (error) {
      console.error("Error updating favorites:", error);
      toast({ variant: 'destructive', title: "Error", description: "Could not update favorites." });
    }
  };

  const handleStartChat = async () => {
    if (!user || !firestore || !apartment || !landlord) {
      router.push('/login');
      return;
    }

    if (isLandlord) {
        return;
    }

    const chatId = [user.uid, landlord.id, apartment.id].sort().join('_');
    const chatsCollection = collection(firestore, 'chats');

    const q = query(
      chatsCollection,
      where('participantIds', 'array-contains', user.uid),
      where('apartmentId', '==', apartment.id)
    );
    
    const querySnapshot = await getDocs(q);
    const existingChat = querySnapshot.docs.find(d => d.data().participantIds.includes(landlord.id));

    if (existingChat) {
        router.push(`/dashboard/messages/${existingChat.id}`);
    } else {
        const newChat = await addDoc(chatsCollection, {
            participantIds: [user.uid, landlord.id],
            apartmentId: apartment.id,
            createdAt: serverTimestamp(),
            lastMessage: `Initiated conversation about "${apartment.title}"`,
            lastMessageTimestamp: serverTimestamp(),
        });
        router.push(`/dashboard/messages/${newChat.id}`);
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
                      src={photo.imageUrl}
                      alt={`${apartment.title} - photo ${index + 1}`}
                      fill
                      className="object-cover"
                      data-ai-hint={photo.imageHint}
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
                <span>{apartment.location.address}</span>
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
                        <DollarSign className="mr-2 h-7 w-7 text-muted-foreground" />
                        <span>{apartment.price.toLocaleString()} <span className="text-lg font-normal text-muted-foreground">/ month</span></span>
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
                        <span>Available: {new Date(apartment.availabilityDate).toLocaleDateString() !== 'Invalid Date' ? new Date(apartment.availabilityDate).toLocaleDateString() : apartment.availabilityDate}</span>
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
                            <AvatarImage src={landlord.profilePictureUrl} alt={landlord.name} />
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
                  <ReviewForm landlordId={landlord.id} userId={user.uid} />
                </DialogContent>
              </Dialog>
            )}

        </div>
      </div>
    </div>
  );
}

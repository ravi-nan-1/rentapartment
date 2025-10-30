'use client';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import Image from 'next/image';
import {
  getUserPersonalizedApartmentRecommendations,
  type UserProfile,
  type ApartmentListing,
} from '@/ai/flows/user-personalized-apartment-recommendations';
import { Skeleton } from '../ui/skeleton';
import { Badge } from '../ui/badge';

function RecommendationCard({ listing }: { listing: ApartmentListing }) {
  return (
    <Card className="overflow-hidden">
      <div className="relative h-48 w-full">
        <Image src={listing.photoDataUri} alt={listing.listingId} fill className="object-cover" />
      </div>
      <CardHeader>
        <CardTitle className="text-lg leading-tight">{listing.listingId}</CardTitle>
        <CardDescription className="line-clamp-2">{listing.listingDescription}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <p className="font-bold text-lg">${listing.price.toLocaleString()}</p>
          <p className="text-sm text-muted-foreground">{listing.location}</p>
        </div>
        <div className="mt-2 flex flex-wrap gap-1">
            {listing.amenities.slice(0, 3).map(amenity => (
                <Badge key={amenity} variant="secondary">{amenity}</Badge>
            ))}
        </div>
      </CardContent>
    </Card>
  );
}

function LoadingState() {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => (
                 <Card key={i}>
                    <Skeleton className="h-48 w-full" />
                    <CardHeader>
                        <Skeleton className="h-5 w-3/4" />
                        <Skeleton className="h-4 w-full mt-2" />
                        <Skeleton className="h-4 w-5/6 mt-1" />
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center justify-between">
                            <Skeleton className="h-6 w-20" />
                            <Skeleton className="h-4 w-24" />
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    )
}

export default function PersonalizedRecs({ userProfile }: { userProfile: any }) {
  const [recommendations, setRecommendations] = useState<ApartmentListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (userProfile) {
      const fetchRecommendations = async () => {
        setLoading(true);
        setError(null);
        try {
          const profile: UserProfile = {
            userId: userProfile.id,
            locationPreferences: userProfile.locationPreferences || ['San Francisco', 'Downtown'],
            priceRange: userProfile.priceRange || { min: 2000, max: 4000 },
            desiredAmenities: userProfile.desiredAmenities || ['Gym', 'In-unit washer/dryer', 'Parking'],
            profileDescription: userProfile.profileDescription || 'A young professional working in tech, looking for a modern 1-2 bedroom apartment close to public transport. Values a quiet environment but also proximity to restaurants and cafes. Pet friendly is a plus.',
          };
          const result = await getUserPersonalizedApartmentRecommendations(profile);
          setRecommendations(result);
        } catch (e) {
          console.error(e);
          setError('Failed to fetch recommendations. Please try again later.');
        } finally {
          setLoading(false);
        }
      };
      fetchRecommendations();
    }
  }, [userProfile]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Personalized For You</CardTitle>
        <CardDescription>Based on your profile, here are some apartments you might like.</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
            <LoadingState />
        ) : error ? (
            <p className="text-destructive">{error}</p>
        ) : recommendations.length === 0 ? (
            <p>No recommendations found at this time.</p>
        ) : (
            <Carousel opts={{ align: 'start' }} className="w-full">
                <CarouselContent className="-ml-4">
                {recommendations.map((rec, index) => (
                    <CarouselItem key={index} className="pl-4 md:basis-1/2 lg:basis-1/3">
                        <div className="p-1">
                             <RecommendationCard listing={rec} />
                        </div>
                    </CarouselItem>
                ))}
                </CarouselContent>
                <CarouselPrevious />
                <CarouselNext />
            </Carousel>
        )}
      </CardContent>
    </Card>
  );
}

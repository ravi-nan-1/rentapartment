'use client';

import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Star } from 'lucide-react';
import { format } from 'date-fns';
import { Skeleton } from '../ui/skeleton';
import apiFetch from '@/lib/api';
import type { Review } from '@/lib/types';


interface LandlordReviewsProps {
  landlordId: string;
}

function StarRating({ rating }: { rating: number }) {
    return (
        <div className="flex items-center">
            {[...Array(5)].map((_, i) => (
                <Star key={i} className={`h-5 w-5 ${i < rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} />
            ))}
        </div>
    );
}

function LandlordReviewsLoading() {
    return (
        <Card className="mt-8">
            <CardHeader>
                <CardTitle>Landlord Reviews</CardTitle>
                <CardDescription>What other tenants are saying.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
               {[...Array(2)].map((_, i) => (
                <div key={i} className="flex gap-4">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="flex-1 space-y-2">
                      <div className="flex justify-between items-center">
                          <Skeleton className="h-4 w-24" />
                          <Skeleton className="h-4 w-20" />
                      </div>
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-4/5" />
                  </div>
                </div>
               ))}
            </CardContent>
        </Card>
    );
}


export default function LandlordReviews({ landlordId }: LandlordReviewsProps) {
    const [reviews, setReviews] = useState<Review[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!landlordId) return;

        const fetchReviews = async () => {
            try {
                setLoading(true);
                const data = await apiFetch(`/landlords/${landlordId}/reviews`);
                setReviews(data);
            } catch (error) {
                console.error("Failed to fetch reviews", error);
            } finally {
                setLoading(false);
            }
        };

        fetchReviews();
    }, [landlordId]);

  
  const averageRating = useMemo(() => {
    if (!reviews || reviews.length === 0) return 0;
    const total = reviews.reduce((acc, review) => acc + review.rating, 0);
    return total / reviews.length;
  }, [reviews]);

  if (loading) {
    return <LandlordReviewsLoading />;
  }

  return (
    <Card className="mt-8">
      <CardHeader>
        <div className="flex justify-between items-center">
            <div>
                 <CardTitle>Landlord Reviews</CardTitle>
                 <CardDescription>What other tenants are saying.</CardDescription>
            </div>
            {reviews && reviews.length > 0 && (
                <div className="flex items-center gap-2">
                    <StarRating rating={averageRating} />
                    <span className="font-bold text-lg">{averageRating.toFixed(1)}</span>
                    <span className="text-sm text-muted-foreground">({reviews.length} reviews)</span>
                </div>
            )}
        </div>
      </CardHeader>
      <CardContent>
        {(!reviews || reviews.length === 0) ? (
          <p className="text-muted-foreground">This landlord has no reviews yet.</p>
        ) : (
          <div className="space-y-6">
            {reviews.map((review) => (
              <div key={review.id} className="flex gap-4">
                <Avatar>
                  <AvatarImage src={review.user?.profile_picture_url} />
                  <AvatarFallback>{review.user?.name?.charAt(0) ?? 'A'}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                    <div className="flex justify-between items-center">
                        <div>
                             <p className="font-semibold">{review.user?.name ?? 'Anonymous User'}</p>
                             <StarRating rating={review.rating} />
                        </div>
                        <p className="text-xs text-muted-foreground">
                            {review.created_at ? format(new Date(review.created_at), 'PPP') : ''}
                        </p>
                    </div>
                    <p className="mt-2 text-sm">{review.comment}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

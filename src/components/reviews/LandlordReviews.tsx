'use client';

import { useFirestore } from '@/firebase';
import { useCollection } from '@/firebase/firestore/use-collection';
import { collection, query, where, orderBy } from 'firebase/firestore';
import { useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Star } from 'lucide-react';
import { format } from 'date-fns';

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

export default function LandlordReviews({ landlordId }: LandlordReviewsProps) {
  const firestore = useFirestore();

  const reviewsQuery = useMemo(() => {
    if (!firestore) return null;
    return query(
        collection(firestore, 'reviews'), 
        where('landlordId', '==', landlordId),
        orderBy('createdAt', 'desc')
    );
  }, [firestore, landlordId]);

  const { data: reviews, loading } = useCollection(reviewsQuery);
  
  const averageRating = useMemo(() => {
    if (!reviews || reviews.length === 0) return 0;
    const total = reviews.reduce((acc, review) => acc + review.rating, 0);
    return total / reviews.length;
  }, [reviews]);

  if (loading) {
    return (
       <Card className="mt-8">
            <CardHeader>
                <CardTitle>Landlord Reviews</CardTitle>
            </CardHeader>
            <CardContent>
                <p>Loading reviews...</p>
            </CardContent>
        </Card>
    );
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
                  {/* In a real app, you'd fetch the user's profile picture */}
                  <AvatarFallback>{review.userId.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                    <div className="flex justify-between items-center">
                        <div>
                             <p className="font-semibold">Anonymous User</p>
                             <StarRating rating={review.rating} />
                        </div>
                        <p className="text-xs text-muted-foreground">
                            {review.createdAt ? format(review.createdAt.toDate(), 'PPP') : ''}
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
  </change>
  <change>
    <file>src/components/reviews/ReviewForm.tsx</file>
    <content><![CDATA['use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Star } from 'lucide-react';
import { useFirestore } from '@/firebase';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';

const formSchema = z.object({
  rating: z.number().min(1, 'Please select a rating').max(5),
  comment: z.string().min(10, 'Review must be at least 10 characters.').max(500, 'Review cannot exceed 500 characters.'),
});

interface ReviewFormProps {
  landlordId: string;
  userId: string;
}

export default function ReviewForm({ landlordId, userId }: ReviewFormProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [hoverRating, setHoverRating] = useState(0);
  const firestore = useFirestore();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      rating: 0,
      comment: '',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    if (!firestore) {
      toast({ variant: "destructive", title: "Error", description: "Database not available." });
      setIsLoading(false);
      return;
    }

    try {
      await addDoc(collection(firestore, 'reviews'), {
        ...values,
        landlordId,
        userId,
        createdAt: serverTimestamp(),
      });
      toast({ title: "Review Submitted!", description: "Thank you for your feedback." });
      // Here you would typically close the dialog
      form.reset();

    } catch (error) {
      console.error("Error submitting review:", error);
      toast({ variant: "destructive", title: "Submission Failed", description: "Could not submit your review." });
    } finally {
      setIsLoading(false);
    }
  }

  const currentRating = form.watch('rating');

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="rating"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Rating</FormLabel>
              <FormControl>
                <div className="flex items-center gap-1" onMouseLeave={() => setHoverRating(0)}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`h-8 w-8 cursor-pointer transition-colors ${
                        (hoverRating >= star || currentRating >= star) 
                          ? 'text-yellow-400 fill-yellow-400' 
                          : 'text-gray-300'
                      }`}
                      onClick={() => field.onChange(star)}
                      onMouseEnter={() => setHoverRating(star)}
                    />
                  ))}
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="comment"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Your Review</FormLabel>
              <FormControl>
                <Textarea placeholder="Share your experience with this landlord..." {...field} rows={4} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={isLoading} className="w-full">
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Submit Review
        </Button>
      </form>
    </Form>
  );
}

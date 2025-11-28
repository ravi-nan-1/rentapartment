'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import ApartmentGrid from '@/components/apartments/ApartmentGrid';
import { Heart } from 'lucide-react';
import apiFetch from '@/lib/api';
import type { Apartment } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';

function FavoritesLoading() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[...Array(3)].map((_, i) => (
        <Card key={i}>
          <Skeleton className="h-48 w-full" />
          <CardHeader>
            <Skeleton className="h-5 w-3/4" />
          </CardHeader>
          <CardContent className="grid gap-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-6 w-1/2" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export default function FavoritesPage() {
  const [favoriteApartments, setFavoriteApartments] = useState<Apartment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFavorites = async () => {
      try {
        setLoading(true);
        const data = await apiFetch('/favorites');
        setFavoriteApartments(data);
      } catch (error) {
        console.error("Failed to fetch favorites:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchFavorites();
  }, []);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">My Favorite Listings</h1>
        <p className="text-muted-foreground">The apartments you've saved for later.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Saved Apartments</CardTitle>
          <CardDescription>
            Here are all the listings you&apos;ve marked as a favorite.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading && <FavoritesLoading />}
          {!loading && favoriteApartments.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <Heart className="mx-auto h-12 w-12" />
              <p className="mt-4">You haven&apos;t favorited any apartments yet.</p>
              <p className="text-sm">Click the heart icon on any listing to save it here.</p>
            </div>
          )}
          {!loading && favoriteApartments.length > 0 && (
            <ApartmentGrid apartments={favoriteApartments} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}

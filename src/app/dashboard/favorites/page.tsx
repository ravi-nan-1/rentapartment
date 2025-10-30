'use client';

import { useUser, useFirestore } from '@/firebase';
import { useCollection } from '@/firebase/firestore/use-collection';
import { collection, query, where, documentId } from 'firebase/firestore';
import { useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import ApartmentGrid from '@/components/apartments/ApartmentGrid';
import { Heart } from 'lucide-react';

export default function FavoritesPage() {
  const { user } = useUser();
  const firestore = useFirestore();

  const favoriteIds = user?.favoriteApartmentIds || [];

  const favoritesQuery = useMemo(() => {
    if (!firestore || favoriteIds.length === 0) return null;
    return query(collection(firestore, 'apartments'), where(documentId(), 'in', favoriteIds));
  }, [firestore, favoriteIds]);

  const { data: favoriteApartments, loading } = useCollection(favoritesQuery);

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
          {loading && <p>Loading your favorite apartments...</p>}
          {!loading && (!favoriteApartments || favoriteApartments.length === 0) && (
            <div className="text-center py-12 text-muted-foreground">
              <Heart className="mx-auto h-12 w-12" />
              <p className="mt-4">You haven&apos;t favorited any apartments yet.</p>
              <p className="text-sm">Click the heart icon on any listing to save it here.</p>
            </div>
          )}
          {favoriteApartments && favoriteApartments.length > 0 && (
            <ApartmentGrid apartments={favoriteApartments} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}

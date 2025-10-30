'use client';

import { useFirestore } from '@/firebase';
import { useCollection } from '@/firebase/firestore/use-collection';
import { collection, query } from 'firebase/firestore';
import { useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Map as MapIcon, LayoutGrid } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ApartmentGrid from '@/components/apartments/ApartmentGrid';
import ApartmentMap from '@/components/apartments/ApartmentMap';
import { GoogleMapsProvider } from '@/components/apartments/GoogleMapsProvider';
import { Skeleton } from '@/components/ui/skeleton';

function HomePageLoading() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[...Array(6)].map((_, i) => (
        <Card key={i}>
          <Skeleton className="h-48 w-full" />
          <CardHeader>
            <Skeleton className="h-5 w-3/4" />
          </CardHeader>
          <CardContent className="grid gap-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-6 w-1/2" />
            <Skeleton className="h-4 w-3/4" />
          </CardContent>
          <CardFooter>
             <Skeleton className="h-6 w-1/4" />
             <Skeleton className="h-6 w-1/4 ml-2" />
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}

import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';

export default function Home() {
  const firestore = useFirestore();

  const apartmentsQuery = useMemo(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'apartments'));
  }, [firestore]);

  const { data: apartments, loading } = useCollection(apartmentsQuery);

  return (
    <div className="container mx-auto px-4 py-8 fade-in">
      <section className="text-center py-16">
        <h1 className="text-5xl font-bold tracking-tight text-foreground">
          Find Your Next Home with <span className="text-primary">Apartment Spot</span>
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">
          The easiest way to find your perfect apartment.
        </p>
        <div className="mt-8 mx-auto max-w-2xl flex items-center space-x-2">
          <Input
            type="text"
            placeholder="Search by city, neighborhood, or address..."
            className="flex-grow text-base"
          />
          <Button type="submit" size="lg" style={{ backgroundColor: 'hsl(var(--accent))', color: 'hsl(var(--accent-foreground))' }}>
            <Search className="mr-2 h-5 w-5" /> Search
          </Button>
        </div>
      </section>

      <section>
        <Tabs defaultValue="grid" className="w-full">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-3xl font-bold">Featured Apartments</h2>
            <TabsList>
              <TabsTrigger value="grid">
                <LayoutGrid className="mr-2 h-4 w-4" />
                Grid View
              </TabsTrigger>
              <TabsTrigger value="map">
                <MapIcon className="mr-2 h-4 w-4" />
                Map View
              </TabsTrigger>
            </TabsList>
          </div>
          <TabsContent value="grid">
            {loading ? <HomePageLoading /> : <ApartmentGrid apartments={apartments || []} />}
          </TabsContent>
          <TabsContent value="map">
            <GoogleMapsProvider>
              <div className="h-[600px] w-full rounded-lg overflow-hidden border">
                <ApartmentMap apartments={apartments || []} />
              </div>
            </GoogleMapsProvider>
          </TabsContent>
        </Tabs>
      </section>
    </div>
  );
}

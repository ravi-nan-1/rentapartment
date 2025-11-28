'use client';

import { useFirestore } from '@/firebase';
import { useCollection } from '@/firebase/firestore/use-collection';
import { collection, query, writeBatch, doc } from 'firebase/firestore';
import { useMemo, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { LayoutGrid, MapIcon, SlidersHorizontal } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ApartmentGrid from '@/components/apartments/ApartmentGrid';
import ApartmentMap from '@/components/apartments/ApartmentMap';
import { GoogleMapsProvider } from '@/components/apartments/GoogleMapsProvider';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { seedApartments } from '@/lib/seed-data';
import type { Apartment } from '@/lib/types';
import AdvancedFilters from '@/components/apartments/AdvancedFilters';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"


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

export default function Home() {
  const firestore = useFirestore();
  
  const apartmentsQuery = useMemo(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'apartments'));
  }, [firestore]);

  const { data: apartments, loading } = useCollection(apartmentsQuery);
  const [filteredApartments, setFilteredApartments] = useState<Apartment[] | null>(null);
  
  useEffect(() => {
    const seedDatabase = async () => {
      if (firestore && apartments && apartments.length === 0 && !loading) {
        console.log('No apartments found. Seeding database...');
        try {
          const batch = writeBatch(firestore);
          const apartmentsCollection = collection(firestore, 'apartments');
          seedApartments.forEach(apt => {
            // Use the hardcoded ID from seed data if available, otherwise generate a new one
            const docRef = apt.id ? doc(apartmentsCollection, apt.id) : doc(apartmentsCollection);
            batch.set(docRef, apt);
          });
          await batch.commit();
          console.log('Database seeded successfully.');
        } catch(e) {
          console.error("Seeding failed: ", e)
        }
      }
    };

    seedDatabase();
  }, [firestore, apartments, loading]);

  useEffect(() => {
    // If firestore data is loaded, use it. Otherwise, if not loading, use the seed data as a fallback.
    if (apartments) {
      setFilteredApartments(apartments);
    } else if (!loading) {
      setFilteredApartments(seedApartments as Apartment[]);
    }
  }, [apartments, loading]);

  const displayLoading = loading || !filteredApartments;

  return (
    <div className="container mx-auto px-4 py-8 fade-in">
      <section className="text-center py-12">
        <h1 className="text-5xl font-bold tracking-tight text-foreground">
          Find Your Next Home with <span className="text-primary">Apartment Spot</span>
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">
          The easiest way to find your perfect apartment.
        </p>
         <div className="mt-8 mx-auto max-w-5xl hidden md:block">
           <AdvancedFilters apartments={apartments || []} setFilteredApartments={setFilteredApartments} />
        </div>
      </section>

      <section>
        <Tabs defaultValue="grid" className="w-full">
          <div className="flex justify-between items-center mb-4">
             <h2 className="text-3xl font-bold">Featured Apartments</h2>

            <div className="flex items-center gap-2">
                <div className="md:hidden">
                    <Sheet>
                        <SheetTrigger asChild>
                            <Button variant="outline" size="icon">
                                <SlidersHorizontal className="h-4 w-4" />
                            </Button>
                        </SheetTrigger>
                        <SheetContent>
                            <SheetHeader>
                                <SheetTitle>Filters</SheetTitle>
                                <SheetDescription>Refine your apartment search.</SheetDescription>
                            </SheetHeader>
                            <div className="py-4">
                                <AdvancedFilters apartments={apartments || []} setFilteredApartments={setFilteredApartments} isSheet={true}/>
                            </div>
                        </SheetContent>
                    </Sheet>
                 </div>
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
          </div>
          <TabsContent value="grid">
            {displayLoading ? <HomePageLoading /> : <ApartmentGrid apartments={filteredApartments || []} />}
          </TabsContent>
          <TabsContent value="map">
            <GoogleMapsProvider>
              <div className="h-[600px] w-full rounded-lg overflow-hidden border">
                {displayLoading ? <div className="h-full w-full bg-muted animate-pulse" /> : <ApartmentMap apartments={filteredApartments || []} />}
              </div>
            </GoogleMapsProvider>
          </TabsContent>
        </Tabs>
      </section>
    </div>
  );
}

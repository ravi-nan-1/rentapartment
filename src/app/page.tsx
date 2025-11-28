'use client';

import { useFirestore } from '@/firebase';
import { useCollection } from '@/firebase/firestore/use-collection';
import { collection, query, getDocs, writeBatch, doc } from 'firebase/firestore';
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
  const [isSeeding, setIsSeeding] = useState(false);

  const apartmentsQuery = useMemo(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'apartments'));
  }, [firestore]);

  const { data: apartments, loading } = useCollection(apartmentsQuery);
  const [filteredApartments, setFilteredApartments] = useState<Apartment[] | null>(null);
  
  useEffect(() => {
    const seedDatabase = async () => {
      if (firestore && !loading && apartments && apartments.length === 0) {
        setIsSeeding(true);
        console.log('No apartments found. Seeding database...');
        const apartmentsCollection = collection(firestore, 'apartments');
        const querySnapshot = await getDocs(apartmentsCollection);

        if (querySnapshot.empty) {
          try {
            const batch = writeBatch(firestore);
            seedApartments.forEach(apt => {
              const docRef = doc(apartmentsCollection);
              batch.set(docRef, apt);
            });
            await batch.commit();
            console.log('Database seeded successfully.');
          } catch(e) {
            console.error("Seeding failed: ", e)
          } finally {
            setIsSeeding(false);
          }
        } else {
           setIsSeeding(false);
        }
      } else if (!loading) {
         setIsSeeding(false);
      }
    };

    seedDatabase();
  }, [firestore, apartments, loading]);

  useEffect(() => {
    if(apartments){
      setFilteredApartments(apartments);
    }
  }, [apartments]);


  const displayLoading = loading || isSeeding || filteredApartments === null;

  return (
    <div className="container mx-auto px-4 py-8 fade-in">
      <section className="text-center py-12">
        <h1 className="text-5xl font-bold tracking-tight text-foreground">
          Find Your Next Home with <span className="text-primary">Apartment Spot</span>
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">
          The easiest way to find your perfect apartment.
        </p>
         <div className="mt-8 mx-auto max-w-3xl flex items-center space-x-2">
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
                <ApartmentMap apartments={filteredApartments || []} />
              </div>
            </GoogleMapsProvider>
          </TabsContent>
        </Tabs>
      </section>
    </div>
  );
}

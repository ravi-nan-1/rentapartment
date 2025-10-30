import { apartments } from '@/lib/data';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Map as MapIcon, LayoutGrid } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ApartmentGrid from '@/components/apartments/ApartmentGrid';
import ApartmentMap from '@/components/apartments/ApartmentMap';
import { GoogleMapsProvider } from '@/components/apartments/GoogleMapsProvider';

export default function Home() {
  return (
    <div className="container mx-auto px-4 py-8">
      <section className="text-center py-16">
        <h1 className="text-5xl font-bold tracking-tight text-primary-foreground-on-bg">
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
            <ApartmentGrid apartments={apartments} />
          </TabsContent>
          <TabsContent value="map">
            <GoogleMapsProvider>
              <div className="h-[600px] w-full rounded-lg overflow-hidden border">
                <ApartmentMap apartments={apartments} />
              </div>
            </GoogleMapsProvider>
          </TabsContent>
        </Tabs>
      </section>
    </div>
  );
}

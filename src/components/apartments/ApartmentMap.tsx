'use client';

import { useState } from 'react';
import { Map, AdvancedMarker, Pin, InfoWindow } from '@vis.gl/react-google-maps';
import type { Apartment } from '@/lib/types';
import Link from 'next/link';

interface ApartmentMapProps {
  apartments: Apartment[];
}

export default function ApartmentMap({ apartments }: ApartmentMapProps) {
  const [selectedApartment, setSelectedApartment] = useState<Apartment | null>(null);

  const center = apartments.length > 0
    ? { lat: apartments[0].location.lat, lng: apartments[0].location.lng }
    : { lat: 37.7749, lng: -122.4194 };

  return (
    <Map
      style={{ width: '100%', height: '100%' }}
      defaultCenter={center}
      defaultZoom={12}
      gestureHandling={'greedy'}
      disableDefaultUI={true}
      mapId="apartment_spot_map"
    >
      {apartments.map((apt) => (
        <AdvancedMarker
          key={apt.id}
          position={{ lat: apt.location.lat, lng: apt.location.lng }}
          onClick={() => setSelectedApartment(apt)}
        >
          <Pin
            background={'hsl(var(--primary))'}
            borderColor={'hsl(var(--primary-foreground))'}
            glyphColor={'hsl(var(--primary-foreground))'}
          />
        </AdvancedMarker>
      ))}

      {selectedApartment && (
        <InfoWindow
          position={{ lat: selectedApartment.location.lat, lng: selectedApartment.location.lng }}
          onCloseClick={() => setSelectedApartment(null)}
        >
          <div className="p-1 max-w-xs">
            <h3 className="font-bold text-md">{selectedApartment.title}</h3>
            <p className="text-sm text-muted-foreground">{selectedApartment.location.address}</p>
            <p className="text-md font-semibold mt-1">${selectedApartment.price.toLocaleString()}/mo</p>
            <Link href={`/apartments/${selectedApartment.id}`} className="text-primary text-sm font-semibold mt-2 block hover:underline">
              View Details
            </Link>
          </div>
        </InfoWindow>
      )}
    </Map>
  );
}

"use client";

import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useEffect, useRef } from "react";
import type { Apartment } from '@/lib/types';
import ReactDOMServer from 'react-dom/server';

// Fix Leaflet marker icons
if (typeof window !== 'undefined') {
  // @ts-ignore
  delete L.Icon.Default.prototype._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl:
      "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
    iconUrl:
      "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    shadowUrl:
      "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  });
}

const userIcon = L.divIcon({
  html: `<div class="bg-blue-500 p-2 rounded-full border-2 border-white shadow-lg"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-navigation-2"><polygon points="12 2 19 21 12 17 5 21 12 2"></polygon></svg></div>`,
  className: '',
  iconSize: [32, 32],
  iconAnchor: [16, 16],
});

const createApartmentIcon = (price: number) => {
    // Abbreviate price for better display (e.g., 25000 -> 25k)
    const formattedPrice = price >= 1000 ? `₹${Math.round(price / 1000)}k` : `₹${price}`;
    
    return L.divIcon({
        html: `
            <div class="bg-primary text-primary-foreground font-bold text-xs px-2 py-1 rounded-full shadow-md border-2 border-background transition-all hover:scale-110">
                ${formattedPrice}
            </div>
        `,
        className: 'bg-transparent border-0', // Important to override default Leaflet styles
        iconSize: [50, 26],
        iconAnchor: [25, 13], // Center the icon
    });
};


interface ApartmentMapProps {
  apartments: Apartment[];
}

export default function ApartmentMap({ apartments }: ApartmentMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);

  useEffect(() => {
    if (mapRef.current && !mapInstanceRef.current) {
        // Create map instance
        const map = L.map(mapRef.current).setView([26.8467, 80.9462], 13); // Lucknow default
        mapInstanceRef.current = map;

        // Add tile layer
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        }).addTo(map);

        // Get user position
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (pos) => {
                    const userLatLng: [number, number] = [pos.coords.latitude, pos.coords.longitude];
                    if (mapInstanceRef.current) {
                       mapInstanceRef.current.setView(userLatLng, 13);
                       L.marker(userLatLng, { icon: userIcon }).addTo(mapInstanceRef.current).bindPopup("You are here");
                    }
                },
                (err) => console.warn("GPS Error:", err)
            );
        }
    }

    // Cleanup on unmount
    return () => {
        if (mapInstanceRef.current) {
            mapInstanceRef.current.remove();
            mapInstanceRef.current = null;
        }
    };
  }, []);

  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Clear existing markers
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    // Add new markers from the apartments prop
    apartments.forEach((ap) => {
        if (ap.lat != null && ap.lng != null) {

            const popupContent = ReactDOMServer.renderToString(
                <div className="w-48">
                  <a href={`/apartments/${ap.id}`} target="_blank" rel="noopener noreferrer">
                    <div className="relative h-24 w-full mb-2 rounded-md overflow-hidden">
                      {ap?.photos?.[0]?.url && (
                        <img
                          src={ap.photos[0].url}
                          alt={ap.title}
                          className="object-cover w-full h-full"
                        />
                      )}
                    </div>
                    <strong className="text-base font-bold block truncate hover:underline">
                      {ap.title}
                    </strong>
                  </a>
                  <span className="text-sm text-muted-foreground">{ap.address}</span>
                  <br />
                  <span className="font-semibold text-lg text-primary">
                    ₹{ap.price.toLocaleString()}
                  </span>
                </div>
            );

            const apartmentIcon = createApartmentIcon(ap.price);
            const marker = L.marker([ap.lat, ap.lng], { icon: apartmentIcon })
                .addTo(map)
                .bindPopup(popupContent);

            markersRef.current.push(marker);
        }
    });

  }, [apartments]);


  return <div ref={mapRef} style={{ height: "100%", width: "100%" }} />;
}

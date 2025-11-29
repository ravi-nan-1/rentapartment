"use client";

import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useEffect, useRef } from "react";
import type { Apartment } from '@/lib/types';
import Image from 'next/image';
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
  html: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-navigation-2"><polygon points="12 2 19 21 12 17 5 21 12 2"></polygon></svg>`,
  className: 'bg-blue-600 text-white rounded-full p-1.5 shadow-lg border-2 border-white',
  iconSize: [30, 30],
  iconAnchor: [15, 15],
});

const apartmentIcon = L.divIcon({
    html: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="red" stroke="white" stroke-width="1" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-map-pin"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" fill="red"/><circle cx="12" cy="10" r="3" fill="white"/></svg>`,
    className: '',
    iconSize: [40, 40],
    iconAnchor: [20, 40],
    popupAnchor: [0, -40],
});

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
                    map.setView(userLatLng, 13);
                    L.marker(userLatLng, { icon: userIcon }).addTo(map).bindPopup("You are here");
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

    // Add new markers
    apartments.forEach((ap) => {
        if (ap.latitude != null && ap.longitude != null) {
             const popupContent = ReactDOMServer.renderToString(
                <div className="w-40">
                  <a href={`/apartments/${ap.id}`} target="_blank" rel="noopener noreferrer">
                    <div className="relative h-20 w-full mb-2 rounded-md overflow-hidden">
                      {ap?.photos?.[0]?.url && (
                        <img
                          src={ap.photos[0].url}
                          alt={ap.title}
                          className="object-cover w-full h-full"
                        />
                      )}
                    </div>
                    <strong className="text-sm font-bold block truncate hover:underline">{ap.title}</strong>
                  </a>
                  <span className="text-xs text-muted-foreground">{ap.address}</span>
                  <br />
                  <span className="font-semibold text-primary">
                    ₹{ap.price.toLocaleString()}
                  </span>
                </div>
            );

            const marker = L.marker([ap.latitude, ap.longitude], { icon: apartmentIcon })
                .addTo(map)
                .bindPopup(popupContent);
            markersRef.current.push(marker);
        }
    });

  }, [apartments]);


  return <div ref={mapRef} style={{ height: "100%", width: "100%" }} />;
}

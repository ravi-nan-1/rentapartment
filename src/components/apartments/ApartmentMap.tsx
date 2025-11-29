"use client";

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet.markercluster/dist/MarkerCluster.css";
import "leaflet.markercluster/dist/MarkerCluster.Default.css";
import "leaflet.markercluster";
import { useEffect, useState, useRef } from "react";
import type { Apartment } from '@/lib/types';
import Image from 'next/image';
import Link from "next/link";

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
    html: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-map-pin"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>`,
    className: 'text-red-500 fill-red-500/50',
    iconSize: [40, 40],
    iconAnchor: [20, 40],
    popupAnchor: [0, -40],
});


interface ApartmentMapProps {
  apartments: Apartment[];
}

export default function ApartmentMap({ apartments }: ApartmentMapProps) {
  const [userPos, setUserPos] = useState<{ lat: number; lng: number } | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const markersRef = useRef<L.MarkerClusterGroup | null>(null);

  useEffect(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) =>
        setUserPos({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        }),
      (err) => console.warn("GPS Error:", err)
    );
  }, []);

  const mapCenter = userPos || { lat: 26.8467, lng: 80.9462 }; // Lucknow default

  useEffect(() => {
    if (mapContainerRef.current && !mapRef.current) {
        mapRef.current = L.map(mapContainerRef.current, {
            center: [mapCenter.lat, mapCenter.lng],
            zoom: 13,
            scrollWheelZoom: true,
        });

        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: '© OpenStreetMap contributors'
        }).addTo(mapRef.current);
    }
  }, [mapCenter]);

  useEffect(() => {
    const map = mapRef.current;
    if (map && apartments) {
        if (markersRef.current) {
            markersRef.current.clearLayers();
        } else {
             // @ts-ignore
            markersRef.current = L.markerClusterGroup();
            map.addLayer(markersRef.current);
        }

        const apartmentMarkers = apartments
            .filter(ap => ap.latitude && ap.longitude)
            .map(ap => {
                const popupContent = `
                    <div class="w-48">
                      <a href="/apartments/${ap.id}" target="_blank" rel="noopener noreferrer">
                        ${ap?.photos?.[0]?.url ? `
                          <div class="relative h-24 w-full mb-2 rounded-md overflow-hidden">
                            <img
                              src="${ap.photos[0].url}"
                              alt="${ap.title}"
                              style="object-fit: cover; width: 100%; height: 100%;"
                            />
                          </div>
                        ` : ''}
                        <strong class="text-sm font-bold block truncate hover:underline">${ap.title}</strong>
                      </a>
                      <span class="text-xs text-muted-foreground">${ap.address}</span>
                      <br />
                      <span class="font-semibold text-primary">
                        ₹${ap.price.toLocaleString()} / month
                      </span>
                    </div>`;
                return L.marker([ap.latitude, ap.longitude], {icon: apartmentIcon})
                         .bindPopup(popupContent);
            });
        
        markersRef.current.addLayers(apartmentMarkers);

        if (apartmentMarkers.length > 0) {
            const group = new L.FeatureGroup(apartmentMarkers);
            // map.fitBounds(group.getBounds().pad(0.2));
        }

    }
  }, [apartments]);

   useEffect(() => {
     const map = mapRef.current;
     if(map && userPos) {
       L.marker([userPos.lat, userPos.lng], { icon: userIcon }).addTo(map)
         .bindPopup("You are here");
     }
   }, [userPos, mapRef.current])

  return (
    <div id="map" ref={mapContainerRef} style={{ height: "100%", width: "100%" }} />
  );
}
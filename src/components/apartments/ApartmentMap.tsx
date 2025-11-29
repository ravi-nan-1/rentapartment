"use client";

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet.markercluster/dist/MarkerCluster.css";
import "leaflet.markercluster/dist/MarkerCluster.Default.css";
import "leaflet.markercluster";
import { useEffect, useState, useRef } from "react";
import type { Apartment } from '@/lib/types';
import Image from 'next/image';

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
  html: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-navigation"><polygon points="3 11 22 2 13 21 11 13 3 11"></polygon></svg>`,
  className: 'bg-blue-500 text-white rounded-full p-1 shadow-lg',
  iconSize: [24, 24],
  iconAnchor: [12, 12],
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
                    <div class="w-40">
                      ${ap?.photos?.[0]?.url ? `
                        <div class="relative h-20 w-full mb-2 rounded-md overflow-hidden">
                          <img
                            src="${ap.photos[0].url}"
                            alt="Apartment"
                            style="object-fit: cover; width: 100%; height: 100%;"
                          />
                        </div>
                      ` : ''}
                      <strong class="text-sm font-bold block truncate">${ap.title}</strong>
                      <span class="text-xs text-muted-foreground">${ap.address}</span>
                      <br />
                      <span class="font-semibold text-primary">
                        ₹${ap.price.toLocaleString()}
                      </span>
                    </div>`;
                return L.marker([ap.latitude, ap.longitude])
                         .bindPopup(popupContent);
            });
        
        markersRef.current.addLayers(apartmentMarkers);
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

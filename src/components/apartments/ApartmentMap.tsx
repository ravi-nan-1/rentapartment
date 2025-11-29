"use client";

import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
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
  const [userPos, setUserPos] = useState<{ lat: number; lng: number } | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  
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
    if (mapRef.current && userPos) {
      mapRef.current.setView([userPos.lat, userPos.lng], 13);
    }
  }, [userPos]);

  return (
    <MapContainer
      center={[mapCenter.lat, mapCenter.lng]}
      zoom={13}
      scrollWheelZoom={true}
      style={{ height: "100%", width: "100%" }}
      whenCreated={map => { mapRef.current = map; }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {userPos && (
        <Marker position={[userPos.lat, userPos.lng]} icon={userIcon}>
          <Popup>You are here</Popup>
        </Marker>
      )}
      {apartments.map((ap) => {
        if (ap.latitude != null && ap.longitude != null) {
          return (
            <Marker
              key={ap.id}
              position={[ap.latitude, ap.longitude]}
              icon={apartmentIcon}
            >
              <Popup>
                <div className="w-40">
                  <Link href={`/apartments/${ap.id}`} passHref>
                    <div className="relative h-20 w-full mb-2 rounded-md overflow-hidden">
                      {ap?.photos?.[0]?.url && (
                        <Image
                          src={ap.photos[0].url}
                          alt={ap.title}
                          fill
                          className="object-cover"
                        />
                      )}
                    </div>
                    <strong className="text-sm font-bold block truncate hover:underline">{ap.title}</strong>
                  </Link>
                  <span className="text-xs text-muted-foreground">{ap.address}</span>
                  <br />
                  <span className="font-semibold text-primary">
                    ₹{ap.price.toLocaleString()}
                  </span>
                </div>
              </Popup>
            </Marker>
          );
        }
        return null;
      })}
    </MapContainer>
  );
}
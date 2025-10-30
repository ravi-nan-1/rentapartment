import type { ImagePlaceholder } from './placeholder-images';
import type { Timestamp } from 'firebase/firestore';

export type User = {
  id: string;
  name: string;
  email: string;
  password?: string;
  role: 'user' | 'landlord' | 'admin';
  mobile?: string;
  address?: string;
  profilePictureUrl?: string;
};

export type Apartment = {
  id: string;
  landlordId: string;
  title: string;
  description: string;
  location: {
    address: string;
    lat: number;
    lng: number;
  };
  price: number;
  bedrooms: number;
  bathrooms: number;
  availabilityDate: string;
  photos: ImagePlaceholder[];
  amenities: string[];
  conditions?: string;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
};

import type { User, Apartment } from './types';
import { PlaceHolderImages } from './placeholder-images';

const getImage = (id: string) => {
  const img = PlaceHolderImages.find((img) => img.id === id);
  if (!img) throw new Error(`Image with id ${id} not found`);
  return img;
};

export const users: User[] = [
  {
    id: 'user1',
    name: 'John Doe',
    email: 'john.doe@example.com',
    password: 'password123',
    role: 'user',
    mobile: '123-456-7890',
    profilePictureUrl: getImage('profile-1').imageUrl,
  },
  {
    id: 'user2',
    name: 'Jane Smith',
    email: 'jane.smith@example.com',
    password: 'password123',
    role: 'landlord',
    mobile: '098-765-4321',
    address: '123 Landlord Lane, Realville, USA',
    profilePictureUrl: getImage('profile-2').imageUrl,
  },
  {
    id: 'user3',
    name: 'Admin User',
    email: 'admin@apartmentspot.com',
    password: 'adminpass',
    role: 'admin',
  },
  {
    id: 'user4',
    name: 'Emily White',
    email: 'emily.white@example.com',
    password: 'password123',
    role: 'user',
    mobile: '555-555-5555',
    profilePictureUrl: getImage('profile-3').imageUrl,
  },
  {
    id: 'user5',
    name: 'Michael Brown',
    email: 'michael.brown@example.com',
    password: 'password123',
    role: 'landlord',
    mobile: '222-333-4444',
    address: '456 Property Place, Realville, USA',
    profilePictureUrl: getImage('profile-4').imageUrl,
  },
];

export const apartments: Apartment[] = [
  {
    id: 'apt1',
    landlordId: 'user2',
    title: 'Sunny 2-Bedroom in Downtown',
    description: 'A beautiful and sunny 2-bedroom apartment right in the heart of the city. Comes with modern amenities and a great view.',
    location: {
      address: '123 Main St, San Francisco, CA',
      lat: 37.7749,
      lng: -122.4194,
    },
    price: 3200,
    bedrooms: 2,
    bathrooms: 2,
    availabilityDate: '2024-09-01',
    photos: [getImage('apartment-1'), getImage('apartment-2'), getImage('apartment-3')],
    amenities: ['In-unit washer/dryer', 'Gym', 'Rooftop deck', 'Parking'],
  },
  {
    id: 'apt2',
    landlordId: 'user5',
    title: 'Cozy Studio near the Park',
    description: 'Perfect for a single professional. This cozy studio is located next to a beautiful park, ideal for morning jogs.',
    location: {
      address: '456 Park Ave, New York, NY',
      lat: 40.758,
      lng: -73.979,
    },
    price: 2100,
    bedrooms: 0,
    bathrooms: 1,
    availabilityDate: '2024-08-15',
    photos: [getImage('apartment-4')],
    amenities: ['Pet-friendly', 'Dishwasher', 'Hardwood floors'],
  },
  {
    id: 'apt3',
    landlordId: 'user2',
    title: 'Spacious Family Home',
    description: 'A large 3-bedroom apartment perfect for families. Located in a quiet neighborhood with great schools nearby.',
    location: {
      address: '789 Suburbia Ln, Austin, TX',
      lat: 30.2672,
      lng: -97.7431,
    },
    price: 2800,
    bedrooms: 3,
    bathrooms: 2.5,
    availabilityDate: 'available',
    photos: [getImage('apartment-5'), getImage('apartment-6')],
    amenities: ['Backyard', 'Garage', 'Central A/C', 'Swimming pool'],
  },
  {
    id: 'apt4',
    landlordId: 'user5',
    title: 'Modern Loft with City Views',
    description: 'Stunning loft with floor-to-ceiling windows offering panoramic city views. Features an open floor plan and high-end finishes.',
    location: {
      address: '101 Sky High Rd, Chicago, IL',
      lat: 41.8781,
      lng: -87.6298,
    },
    price: 4500,
    bedrooms: 1,
    bathrooms: 1,
    availabilityDate: '2024-10-01',
    photos: [getImage('apartment-7'), getImage('apartment-8')],
    amenities: ['Concierge', 'Fitness center', 'City view', 'Smart home features'],
  },
];

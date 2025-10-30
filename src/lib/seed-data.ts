
import type { Apartment } from '@/lib/types';

export const seedApartments: Omit<Apartment, 'id' | 'createdAt' | 'updatedAt'>[] = [
    {
      landlordId: 'landlord-1',
      title: 'Sunny 2-Bedroom in the Mission',
      description:
        'A bright and spacious 2-bedroom apartment in the heart of the Mission District. Comes with a newly renovated kitchen and a large living room. Close to Dolores Park and top-rated restaurants.',
      location: {
        address: '826 Valencia St, San Francisco, CA 94110',
        lat: 37.7595,
        lng: -122.4214,
      },
      price: 4200,
      bedrooms: 2,
      bathrooms: 1,
      availabilityDate: '2024-08-01',
      photos: [
        {
          id: 'apartment-1',
          description: 'Modern apartment living room',
          imageUrl:
            'https://images.unsplash.com/photo-1515263487990-61b07816b324?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
          imageHint: 'modern apartment',
        },
        {
          id: 'apartment-2',
          description: 'Cozy apartment bedroom',
          imageUrl:
            'https://images.unsplash.com/photo-1595526114035-0d45ed16433d?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
          imageHint: 'cozy bedroom',
        },
      ],
      amenities: ['In-unit washer/dryer', 'Dishwasher', 'Hardwood floors', 'Bike storage'],
      conditions: 'No smoking, pets allowed with a deposit.',
    },
    {
      landlordId: 'landlord-2',
      title: 'Modern 1-Bed with City Views',
      description:
        'Sleek and modern 1-bedroom apartment in a luxury high-rise building. Features floor-to-ceiling windows with stunning city views, a state-of-the-art gym, and a rooftop terrace.',
      location: {
        address: '150 Folsom St, San Francisco, CA 94105',
        lat: 37.788,
        lng: -122.39,
      },
      price: 3800,
      bedrooms: 1,
      bathrooms: 1,
      availabilityDate: 'Available Now',
      photos: [
        {
          id: 'apartment-5',
          description: 'Bright apartment with city view',
          imageUrl:
            'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
          imageHint: 'city view',
        },
         {
          id: 'apartment-3',
          description: 'Spacious apartment kitchen',
          imageUrl:
            'https://images.unsplash.com/photo-1556912173-3bb406ef7e77?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
          imageHint: 'spacious kitchen',
        },
      ],
      amenities: ['Gym', 'Rooftop deck', '24/7 doorman', 'Swimming pool', 'Parking'],
    },
    {
        landlordId: 'landlord-1',
        title: 'Charming Studio in North Beach',
        description: 'Cozy and charming studio located in the historic North Beach neighborhood. Walking distance to Washington Square Park, Coit Tower, and some of the city\'s best Italian food.',
        location: {
            address: '622 Green St, San Francisco, CA 94133',
            lat: 37.7994,
            lng: -122.4095
        },
        price: 2500,
        bedrooms: 0,
        bathrooms: 1,
        availabilityDate: '2024-09-01',
        photos: [
            {
                "id": "apartment-2",
                "description": "Cozy apartment bedroom",
                "imageUrl": "https://images.unsplash.com/photo-1595526114035-0d45ed16433d?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
                "imageHint": "cozy bedroom"
            }
        ],
        amenities: ['Hardwood floors', 'Updated bathroom', 'Shared laundry'],
    },
    {
        landlordId: 'landlord-2',
        title: 'Spacious Family Home in the Sunset',
        description: 'A large 3-bedroom home perfect for a family. Located in a quiet, residential neighborhood with a backyard, garage, and plenty of street parking. Close to Golden Gate Park.',
        location: {
            address: '1457 25th Ave, San Francisco, CA 94122',
            lat: 37.7628,
            lng: -122.4826
        },
        price: 5500,
        bedrooms: 3,
        bathrooms: 2,
        availabilityDate: 'Available Now',
        photos: [
            {
                "id": "apartment-4",
                "description": "Apartment exterior view",
                "imageUrl": "https://images.unsplash.com/photo-1570129477492-45c003edd2be?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
                "imageHint": "apartment exterior"
            }
        ],
        amenities: ['Backyard', 'Garage', 'Washer/Dryer', 'Fireplace'],
        conditions: 'One year lease minimum.'
    }
];

export type User = {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'landlord' | 'admin';
  mobile?: string;
  address?: string;
  profile_picture_url?: string;
  favorite_apartment_ids?: string[];
};

export type ApartmentPhoto = {
  id: string;
  url: string;
  hint: string;
};

export type Apartment = {
  id: string;
  landlord_id: string;
  title: string;
  description: string;
  address: string;
  city: string;
  latitude: number;
  longitude: number;
  price: number;
  bedrooms: number;
  bathrooms: number;
  availability_date: string;
  photos: ApartmentPhoto[];
  amenities: string[];
  conditions?: string;
  created_at: string;
  updated_at: string;
};

export type Chat = {
    id: string;
    apartment_id: string;
    apartment_title: string;
    participants: User[];
    last_message_content: string;
    last_message_timestamp: string;
    created_at: string;
    apartment?: Apartment;
};

export type Message = {
    id: string;
    chat_id: string;
    sender_id: string;
    content: string;
    created_at: string;
}

export type Review = {
    id: string;
    landlord_id: string;
    user_id: string;
    rating: number;
    comment: string;
    created_at: string;
    user?: {
      name: string;
      profile_picture_url?: string;
    }
}


import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { Apartment, User } from '@/lib/types';
import { BedDouble, Bath, MapPin, Calendar, DollarSign, Heart } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { MouseEvent, useState, useEffect } from 'react';
import apiFetch from '@/lib/api';

interface ApartmentCardProps {
  apartment: Apartment;
}

export default function ApartmentCard({ apartment }: ApartmentCardProps) {
  const { user, loading: userLoading, reloadUser } = useAuth();
  const { toast } = useToast();
  
  const [isFavorited, setIsFavorited] = useState(false);

  useEffect(() => {
    if (user && user.favorite_apartment_ids) {
      setIsFavorited(user.favorite_apartment_ids.includes(apartment.id));
    } else {
      setIsFavorited(false);
    }
  }, [user, apartment.id]);


  const firstPhoto = apartment.photos && apartment.photos.length > 0
    ? apartment.photos[0]
    : { url: '/placeholder.svg', hint: 'apartment exterior' };

  const availabilityText = () => {
    if (!apartment.availability_date) return 'Not specified';
    const date = new Date(apartment.availability_date);
    if (!isNaN(date.getTime())) {
      date.setDate(date.getDate() + 1);
      return date.toLocaleDateString();
    }
    return apartment.availability_date;
  };

  const handleFavoriteClick = async (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault(); 
    e.stopPropagation();

    if (!user) {
      toast({
        variant: "destructive",
        title: "Not Logged In",
        description: "You must be logged in to favorite apartments.",
      });
      return;
    }

    try {
      if (isFavorited) {
        await apiFetch(`/favorites/${apartment.id}`, { method: 'DELETE' });
        toast({ title: "Removed from Favorites" });
      } else {
        await apiFetch(`/favorites/${apartment.id}`, { method: 'POST' });
        toast({ title: "Added to Favorites" });
      }
      // Reload user data to get updated favorites
      await reloadUser();
    } catch (error) {
      console.error("Error updating favorites:", error);
      toast({ variant: 'destructive', title: "Error", description: "Could not update favorites." });
    }
  };

  return (
    <Card className="flex flex-col overflow-hidden h-full transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
      <Link href={`/apartments/${apartment.id}`} className="flex-grow flex flex-col">
        <div className="relative w-full h-48">
          <Image
            src={firstPhoto.url}
            alt={apartment.title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover"
            data-ai-hint={firstPhoto.hint}
          />
           {user && !userLoading && (
            <button
              onClick={handleFavoriteClick}
              className="absolute top-2 right-2 bg-black/50 p-2 rounded-full text-white hover:bg-black/75 transition-colors"
              aria-label="Favorite this apartment"
            >
              <Heart className={cn("h-5 w-5", isFavorited ? "fill-red-500 text-red-500" : "fill-transparent")} />
            </button>
          )}
        </div>
        <CardHeader>
          <CardTitle className="text-lg leading-tight">{apartment.title}</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-2 text-sm text-muted-foreground flex-grow">
          <div className="flex items-center">
            <MapPin className="mr-2 h-4 w-4" />
            <span>{apartment.address}</span>
          </div>
          <div className="flex items-center">
            <DollarSign className="mr-2 h-4 w-4" />
            <span className="text-lg font-bold text-foreground">${apartment.price.toLocaleString()}</span>
            <span className="ml-1">/ month</span>
          </div>
          <div className="flex items-center">
            <Calendar className="mr-2 h-4 w-4" />
            <span>
              Available: {availabilityText()}
            </span>
          </div>
        </CardContent>
      </Link>
      <CardFooter className="flex justify-between">
        <div className="flex gap-4 text-sm">
          <Badge variant="secondary" className="flex items-center gap-1">
            <BedDouble className="h-4 w-4" />
            {apartment.bedrooms} Bed{apartment.bedrooms !== 1 ? 's' : ''}
          </Badge>
          <Badge variant="secondary" className="flex items-center gap-1">
            <Bath className="h-4 w-4" />
            {apartment.bathrooms} Bath{apartment.bathrooms !== 1 ? 's' : ''}
          </Badge>
        </div>
      </CardFooter>
    </Card>
  );
}

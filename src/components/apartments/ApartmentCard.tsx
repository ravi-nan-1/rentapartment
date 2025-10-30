import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { Apartment } from '@/lib/types';
import { BedDouble, Bath, MapPin, Calendar, DollarSign } from 'lucide-react';

interface ApartmentCardProps {
  apartment: Apartment;
}

export default function ApartmentCard({ apartment }: ApartmentCardProps) {
  const firstPhoto = apartment.photos && apartment.photos.length > 0
    ? apartment.photos[0]
    : { imageUrl: '/placeholder.svg', imageHint: 'apartment exterior' };

  return (
    <Card className="flex flex-col overflow-hidden h-full transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
      <Link href={`/apartments/${apartment.id}`} className="flex-grow">
        <div className="relative w-full h-48">
          <Image
            src={firstPhoto.imageUrl}
            alt={apartment.title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover"
            data-ai-hint={firstPhoto.imageHint}
          />
        </div>
        <CardHeader>
          <CardTitle className="text-lg leading-tight">{apartment.title}</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-2 text-sm text-muted-foreground flex-grow">
          <div className="flex items-center">
            <MapPin className="mr-2 h-4 w-4" />
            <span>{apartment.location.address}</span>
          </div>
          <div className="flex items-center">
            <DollarSign className="mr-2 h-4 w-4" />
            <span className="text-lg font-bold text-foreground">${apartment.price.toLocaleString()}</span>
            <span className="ml-1">/ month</span>
          </div>
          <div className="flex items-center">
            <Calendar className="mr-2 h-4 w-4" />
            <span>
              Available: {new Date(apartment.availabilityDate).toLocaleDateString() !== 'Invalid Date' ? new Date(apartment.availabilityDate).toLocaleDateString() : apartment.availabilityDate}
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

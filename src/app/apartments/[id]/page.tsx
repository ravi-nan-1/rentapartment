import Image from 'next/image';
import { apartments, users } from '@/lib/data';
import { notFound } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { DollarSign, Calendar, BedDouble, Bath, Building, MapPin, CheckCircle } from 'lucide-react';

export default function ApartmentDetailPage({ params }: { params: { id: string } }) {
  const apartment = apartments.find((apt) => apt.id === params.id);
  
  if (!apartment) {
    notFound();
  }

  const landlord = users.find(u => u.id === apartment.landlordId);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
          <Carousel className="w-full rounded-lg overflow-hidden border">
            <CarouselContent>
              {apartment.photos.map((photo, index) => (
                <CarouselItem key={index}>
                  <div className="relative w-full h-96">
                    <Image
                      src={photo.imageUrl}
                      alt={`${apartment.title} - photo ${index + 1}`}
                      fill
                      className="object-cover"
                      data-ai-hint={photo.imageHint}
                      priority={index === 0}
                    />
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="ml-16" />
            <CarouselNext className="mr-16" />
          </Carousel>
          
          <Card className="mt-8">
            <CardHeader>
              <CardTitle className="text-3xl">{apartment.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center text-muted-foreground mb-4">
                <MapPin className="mr-2 h-4 w-4" />
                <span>{apartment.location.address}</span>
              </div>
              <p className="text-base">{apartment.description}</p>
            </CardContent>
          </Card>

          <Card className="mt-8">
            <CardHeader>
                <CardTitle>Amenities</CardTitle>
            </CardHeader>
            <CardContent>
                <ul className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                    {apartment.amenities.map(amenity => (
                        <li key={amenity} className="flex items-center">
                            <CheckCircle className="h-4 w-4 mr-2 text-primary" />
                            <span>{amenity}</span>
                        </li>
                    ))}
                </ul>
            </CardContent>
          </Card>

        </div>
        <div className="space-y-8">
            <Card>
                <CardHeader>
                    <CardTitle className="text-2xl">Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center text-3xl font-bold">
                        <DollarSign className="mr-2 h-7 w-7 text-muted-foreground" />
                        <span>{apartment.price.toLocaleString()} <span className="text-lg font-normal text-muted-foreground">/ month</span></span>
                    </div>
                     <Separator />
                    <div className="flex items-center text-lg">
                        <BedDouble className="mr-3 h-5 w-5 text-muted-foreground" />
                        <span>{apartment.bedrooms} Bedroom{apartment.bedrooms !== 1 ? 's' : ''}</span>
                    </div>
                    <div className="flex items-center text-lg">
                        <Bath className="mr-3 h-5 w-5 text-muted-foreground" />
                        <span>{apartment.bathrooms} Bathroom{apartment.bathrooms !== 1 ? 's' : ''}</span>
                    </div>
                     <div className="flex items-center text-lg">
                        <Calendar className="mr-3 h-5 w-5 text-muted-foreground" />
                        <span>Available: {new Date(apartment.availabilityDate).toLocaleDateString() !== 'Invalid Date' ? new Date(apartment.availabilityDate).toLocaleDateString() : apartment.availabilityDate}</span>
                    </div>
                    <Separator />
                     <Button size="lg" className="w-full text-lg" style={{ backgroundColor: 'hsl(var(--accent))', color: 'hsl(var(--accent-foreground))' }}>Contact Landlord</Button>
                </CardContent>
            </Card>

            {landlord && (
                <Card>
                    <CardHeader>
                        <CardTitle>About the Landlord</CardTitle>
                    </CardHeader>
                    <CardContent className="flex items-center space-x-4">
                        <Avatar className="h-16 w-16">
                            <AvatarImage src={landlord.profilePictureUrl} alt={landlord.name} />
                            <AvatarFallback>{landlord.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                            <p className="font-semibold">{landlord.name}</p>
                            <p className="text-sm text-muted-foreground">Member since 2023</p>
                        </div>
                    </CardContent>
                </Card>
            )}

            {apartment.conditions && (
                <Card>
                    <CardHeader>
                        <CardTitle>Conditions</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm">{apartment.conditions}</p>
                    </CardContent>
                </Card>
            )}

        </div>
      </div>
    </div>
  );
}

import type { Apartment } from '@/lib/types';
import ApartmentCard from './ApartmentCard';

interface ApartmentGridProps {
  apartments: Apartment[];
}

export default function ApartmentGrid({ apartments }: ApartmentGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {apartments.map((apartment) => (
        <ApartmentCard key={apartment.id} apartment={apartment} />
      ))}
    </div>
  );
}

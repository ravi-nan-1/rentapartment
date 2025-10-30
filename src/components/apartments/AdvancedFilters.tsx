'use client';

import { useState, useEffect } from 'react';
import type { Apartment } from '@/lib/types';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { Search } from 'lucide-react';

interface AdvancedFiltersProps {
  apartments: Apartment[];
  setFilteredApartments: (apartments: Apartment[]) => void;
  isSheet?: boolean;
}

export default function AdvancedFilters({ apartments, setFilteredApartments, isSheet = false }: AdvancedFiltersProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [priceRange, setPriceRange] = useState([0, 8000]);
  const [bedrooms, setBedrooms] = useState('any');
  const [bathrooms, setBathrooms] = useState('any');

  useEffect(() => {
    let filtered = apartments;

    // Search term
    if (searchTerm) {
      filtered = filtered.filter(apt =>
        apt.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        apt.location.address.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Price range
    filtered = filtered.filter(apt => apt.price >= priceRange[0] && apt.price <= priceRange[1]);

    // Bedrooms
    if (bedrooms !== 'any') {
      filtered = filtered.filter(apt => apt.bedrooms >= parseInt(bedrooms));
    }

    // Bathrooms
    if (bathrooms !== 'any') {
      filtered = filtered.filter(apt => apt.bathrooms >= parseInt(bathrooms));
    }
    
    setFilteredApartments(filtered);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm, priceRange, bedrooms, bathrooms, apartments]);

  return (
    <div className={cn("w-full", isSheet ? "space-y-6" : "hidden md:block p-4 border rounded-lg bg-card shadow-sm")}>
      <div className={cn("grid gap-4", isSheet ? "grid-cols-1" : "grid-cols-12")}>
        
        {/* Search Input */}
        <div className={cn(isSheet ? "col-span-1" : "col-span-12 lg:col-span-5")}>
           {!isSheet && <Label>Search</Label>}
           <Input
            type="text"
            placeholder="Search by city, neighborhood, or address..."
            className="flex-grow text-base"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Bedrooms */}
        <div className={cn(isSheet ? "col-span-1" : "col-span-6 lg:col-span-2")}>
          <Label>Bedrooms</Label>
          <Select value={bedrooms} onValueChange={setBedrooms}>
            <SelectTrigger>
              <SelectValue placeholder="Any" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="any">Any</SelectItem>
              <SelectItem value="0">Studio+</SelectItem>
              <SelectItem value="1">1+</SelectItem>
              <SelectItem value="2">2+</SelectItem>
              <SelectItem value="3">3+</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Bathrooms */}
        <div className={cn(isSheet ? "col-span-1" : "col-span-6 lg:col-span-2")}>
          <Label>Bathrooms</Label>
          <Select value={bathrooms} onValueChange={setBathrooms}>
            <SelectTrigger>
              <SelectValue placeholder="Any" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="any">Any</SelectItem>
              <SelectItem value="1">1+</SelectItem>
              <SelectItem value="2">2+</SelectItem>
              <SelectItem value="3">3+</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Price Slider */}
        <div className={cn(isSheet ? "col-span-1" : "col-span-12 lg:col-span-3")}>
          <Label>Price Range: ${priceRange[0]} - ${priceRange[1] === 8000 ? '8000+' : priceRange[1]}</Label>
          <Slider
            min={0}
            max={8000}
            step={100}
            value={priceRange}
            onValueChange={setPriceRange}
          />
        </div>
      </div>
    </div>
  );
}

'use client';

import { useState } from 'react';
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

  const applyFilters = () => {
    if (!apartments) return;

    let newFiltered = apartments;

    // Search term
    if (searchTerm) {
      newFiltered = newFiltered.filter(apt =>
        apt.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        apt.address.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Price range
    newFiltered = newFiltered.filter(apt => apt.price >= priceRange[0] && (priceRange[1] === 8000 ? true : apt.price <= priceRange[1]));

    // Bedrooms
    if (bedrooms !== 'any') {
      newFiltered = newFiltered.filter(apt => apt.bedrooms >= parseInt(bedrooms));
    }

    // Bathrooms
    if (bathrooms !== 'any') {
      newFiltered = newFiltered.filter(apt => apt.bathrooms >= parseInt(bathrooms));
    }
    
    setFilteredApartments(newFiltered);
  };

  const handleResetFilters = () => {
    setSearchTerm('');
    setPriceRange([0, 8000]);
    setBedrooms('any');
    setBathrooms('any');
    setFilteredApartments(apartments);
  };

  return (
    <div className={cn("w-full", isSheet ? "space-y-6" : "p-4 border rounded-lg bg-card shadow-sm")}>
      <div className={cn("grid gap-4", isSheet ? "grid-cols-1" : "md:grid-cols-12")}>
        
        {/* Search Input */}
        <div className={cn(isSheet ? "col-span-1" : "md:col-span-4")}>
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
        <div className={cn(isSheet ? "col-span-1" : "md:col-span-2")}>
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
        <div className={cn(isSheet ? "col-span-1" : "md:col-span-2")}>
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
        <div className={cn(isSheet ? "col-span-1" : "md:col-span-4")}>
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
      <div className={cn("mt-4 flex gap-2", isSheet ? "flex-col" : "justify-end")}>
        <Button variant="outline" onClick={handleResetFilters}>Reset</Button>
        <Button onClick={applyFilters} style={{ backgroundColor: 'hsl(var(--accent))', color: 'hsl(var(--accent-foreground))' }}><Search className="mr-2 h-4 w-4"/> Apply Filters</Button>
      </div>
    </div>
  );
}

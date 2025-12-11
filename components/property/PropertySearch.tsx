'use client';

import { useState } from 'react';
import { Search, MapPin, Home, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function PropertySearch() {
  const [searchType, setSearchType] = useState<'rent' | 'sale'>('rent');
  const [location, setLocation] = useState('');
  const [propertyType, setPropertyType] = useState('');
  const [priceRange, setPriceRange] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement search
    console.log('Search:', { searchType, location, propertyType, priceRange });
  };

  return (
    <form onSubmit={handleSearch} className="space-y-4">
      <div className="flex flex-col md:flex-row gap-4">
        {/* Search Type Toggle */}
        <div className="inline-flex rounded-lg border p-1 bg-white">
          <button
            type="button"
            onClick={() => setSearchType('rent')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              searchType === 'rent'
                ? 'bg-blue-600 text-white'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            For Rent
          </button>
          <button
            type="button"
            onClick={() => setSearchType('sale')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              searchType === 'sale'
                ? 'bg-blue-600 text-white'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            For Sale
          </button>
        </div>

        {/* Location Search */}
        <div className="relative flex-1">
          <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <Input
            type="text"
            placeholder="Enter city, neighborhood, or landmark"
            className="pl-10"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Property Type */}
        <div className="relative">
          <Home className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 z-10" />
          <Select value={propertyType} onValueChange={setPropertyType}>
            <SelectTrigger className="pl-10">
              <SelectValue placeholder="Property Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="apartment">Apartments</SelectItem>
              <SelectItem value="house">Houses</SelectItem>
              <SelectItem value="villa">Villas</SelectItem>
              <SelectItem value="condo">Condos</SelectItem>
              <SelectItem value="commercial">Commercial</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Price Range */}
        <div className="relative">
          <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 z-10" />
          <Select value={priceRange} onValueChange={setPriceRange}>
            <SelectTrigger className="pl-10">
              <SelectValue placeholder="Price Range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="0-1000">$0 - $1,000</SelectItem>
              <SelectItem value="1000-2000">$1,000 - $2,000</SelectItem>
              <SelectItem value="2000-5000">$2,000 - $5,000</SelectItem>
              <SelectItem value="5000+">$5,000+</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Search Button */}
        <Button type="submit" className="h-full bg-blue-600 hover:bg-blue-700">
          <Search className="mr-2 h-5 w-5" />
          Search Properties
        </Button>
      </div>
    </form>
  );
}
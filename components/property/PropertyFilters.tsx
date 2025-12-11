'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface SearchFilters {
  q?: string;
  type?: string;
  category?: string;
  city?: string;
  state?: string;
  minPrice?: string;
  maxPrice?: string;
  bedrooms?: string;
  page?: number;
}

interface PropertyFiltersProps {
  filters: SearchFilters;
  onFilterChange: (filters: Partial<SearchFilters>) => void;
  onReset: () => void;
}

export function PropertyFilters({ filters, onFilterChange, onReset }: PropertyFiltersProps) {
  const handleFilterChange = (key: keyof SearchFilters, value: string) => {
    onFilterChange({ [key]: value });
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold">Filters</h3>
        <Button variant="outline" size="sm" onClick={onReset}>
          Reset
        </Button>
      </div>

      <div className="space-y-4">
        {/* Property Type */}
        <div>
          <label className="block text-sm font-medium mb-2">Property Type</label>
          <Select
            value={filters.type || ''}
            onValueChange={(value) => handleFilterChange('type', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="All Types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Types</SelectItem>
              <SelectItem value="APARTMENT">Apartment</SelectItem>
              <SelectItem value="HOUSE">House</SelectItem>
              <SelectItem value="VILLA">Villa</SelectItem>
              <SelectItem value="COMMERCIAL">Commercial</SelectItem>
              <SelectItem value="OFFICE">Office</SelectItem>
              <SelectItem value="PLOT">Plot</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Category */}
        <div>
          <label className="block text-sm font-medium mb-2">Category</label>
          <Select
            value={filters.category || ''}
            onValueChange={(value) => handleFilterChange('category', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Categories</SelectItem>
              <SelectItem value="SALE">For Sale</SelectItem>
              <SelectItem value="RENT">For Rent</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* City */}
        <div>
          <label className="block text-sm font-medium mb-2">City</label>
          <Input
            placeholder="Enter city"
            value={filters.city || ''}
            onChange={(e) => handleFilterChange('city', e.target.value)}
          />
        </div>

        {/* State */}
        <div>
          <label className="block text-sm font-medium mb-2">State</label>
          <Input
            placeholder="Enter state"
            value={filters.state || ''}
            onChange={(e) => handleFilterChange('state', e.target.value)}
          />
        </div>

        {/* Price Range */}
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-sm font-medium mb-2">Min Price</label>
            <Input
              type="number"
              placeholder="Min"
              value={filters.minPrice || ''}
              onChange={(e) => handleFilterChange('minPrice', e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Max Price</label>
            <Input
              type="number"
              placeholder="Max"
              value={filters.maxPrice || ''}
              onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
            />
          </div>
        </div>

        {/* Bedrooms */}
        <div>
          <label className="block text-sm font-medium mb-2">Bedrooms</label>
          <Select
            value={filters.bedrooms || ''}
            onValueChange={(value) => handleFilterChange('bedrooms', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Any" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Any</SelectItem>
              <SelectItem value="1">1+</SelectItem>
              <SelectItem value="2">2+</SelectItem>
              <SelectItem value="3">3+</SelectItem>
              <SelectItem value="4">4+</SelectItem>
              <SelectItem value="5">5+</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}
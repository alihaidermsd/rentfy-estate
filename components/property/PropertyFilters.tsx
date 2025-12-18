// components/properties/PropertyFilters.tsx
'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Filter, X } from 'lucide-react';
import { propertyTypes, propertyCategories, amenitiesList } from '@/lib/constants';

export default function PropertyFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isExpanded, setIsExpanded] = useState(false);

  // Get current filter values
  const type = searchParams.get('type') || '';
  const category = searchParams.get('category') || '';
  const minPrice = searchParams.get('minPrice') || '';
  const maxPrice = searchParams.get('maxPrice') || '';
  const bedrooms = searchParams.get('bedrooms') || '';
  const bathrooms = searchParams.get('bathrooms') || '';
  const city = searchParams.get('city') || '';
  const selectedAmenities = searchParams.get('amenities')?.split(',') || [];

  const handleFilterChange = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    
    // Reset page when filters change
    params.delete('page');
    
    router.push(`/properties?${params.toString()}`);
  };

  const handleAmenityToggle = (amenity: string) => {
    const params = new URLSearchParams(searchParams.toString());
    const currentAmenities = params.get('amenities')?.split(',') || [];
    
    const newAmenities = currentAmenities.includes(amenity)
      ? currentAmenities.filter(a => a !== amenity)
      : [...currentAmenities, amenity];
    
    if (newAmenities.length > 0) {
      params.set('amenities', newAmenities.join(','));
    } else {
      params.delete('amenities');
    }
    
    params.delete('page');
    router.push(`/properties?${params.toString()}`);
  };

  const clearFilters = () => {
    router.push('/properties');
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Filter className="h-5 w-5 text-gray-500" />
          <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
        </div>
        <button
          onClick={clearFilters}
          className="text-sm text-gray-600 hover:text-gray-900"
        >
          Clear all
        </button>
      </div>

      {/* Property Type */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Property Type
        </label>
        <div className="space-y-2">
          {propertyTypes.map((propertyType) => (
            <button
              key={propertyType.value}
              onClick={() => handleFilterChange('type', 
                type === propertyType.value ? '' : propertyType.value
              )}
              className={`flex items-center w-full text-left px-3 py-2 rounded-lg transition-colors ${
                type === propertyType.value
                  ? 'bg-blue-50 text-blue-700 border border-blue-200'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <span className="mr-2">{propertyType.icon}</span>
              {propertyType.label}
            </button>
          ))}
        </div>
      </div>

      {/* Category */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Category
        </label>
        <div className="space-y-2">
          {propertyCategories.map((cat) => (
            <button
              key={cat.value}
              onClick={() => handleFilterChange('category', 
                category === cat.value ? '' : cat.value
              )}
              className={`flex items-center w-full text-left px-3 py-2 rounded-lg transition-colors ${
                category === cat.value
                  ? 'bg-blue-50 text-blue-700 border border-blue-200'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <span className="mr-2">{cat.icon}</span>
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Price Range
        </label>
        <div className="grid grid-cols-2 gap-3">
          <input
            type="number"
            placeholder="Min Price"
            value={minPrice}
            onChange={(e) => handleFilterChange('minPrice', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          <input
            type="number"
            placeholder="Max Price"
            value={maxPrice}
            onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      {/* Bedrooms & Bathrooms */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Bedrooms
          </label>
          <select
            value={bedrooms}
            onChange={(e) => handleFilterChange('bedrooms', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Any</option>
            {[1, 2, 3, 4, 5, 6].map(num => (
              <option key={num} value={num}>{num}+</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Bathrooms
          </label>
          <select
            value={bathrooms}
            onChange={(e) => handleFilterChange('bathrooms', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Any</option>
            {[1, 2, 3, 4].map(num => (
              <option key={num} value={num}>{num}+</option>
            ))}
          </select>
        </div>
      </div>

      {/* Location */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          City
        </label>
        <input
          type="text"
          placeholder="Enter city"
          value={city}
          onChange={(e) => handleFilterChange('city', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      {/* Expandable Amenities Section */}
      <div>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center justify-between w-full text-sm font-medium text-gray-700 mb-3"
        >
          <span>Amenities</span>
          <span>{isExpanded ? '−' : '+'}</span>
        </button>
        
        {isExpanded && (
          <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
            {amenitiesList.map((amenity) => (
              <label
                key={amenity}
                className="flex items-center cursor-pointer hover:bg-gray-50 p-2 rounded"
              >
                <input
                  type="checkbox"
                  checked={selectedAmenities.includes(amenity)}
                  onChange={() => handleAmenityToggle(amenity)}
                  className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                />
                <span className="ml-3 text-sm text-gray-700">{amenity}</span>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Active Filters */}
      {(
        type || 
        category || 
        minPrice || 
        maxPrice || 
        bedrooms || 
        bathrooms || 
        city || 
        selectedAmenities.length > 0
      ) && (
        <div className="mt-6 pt-6 border-t border-gray-200">
          <h4 className="text-sm font-medium text-gray-700 mb-3">Active Filters</h4>
          <div className="flex flex-wrap gap-2">
            {type && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                Type: {propertyTypes.find(t => t.value === type)?.label || type}
                <button
                  onClick={() => handleFilterChange('type', '')}
                  className="ml-2 text-blue-600 hover:text-blue-800"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}
            {category && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                Category: {propertyCategories.find(c => c.value === category)?.label || category}
                <button
                  onClick={() => handleFilterChange('category', '')}
                  className="ml-2 text-green-600 hover:text-green-800"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}
            {selectedAmenities.map(amenity => (
              <span key={amenity} className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                {amenity}
                <button
                  onClick={() => handleAmenityToggle(amenity)}
                  className="ml-2 text-gray-600 hover:text-gray-800"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
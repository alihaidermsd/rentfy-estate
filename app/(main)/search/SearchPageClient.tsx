'use client';

import { useState, useEffect } from 'react';
import { useSearch } from '@/hooks/useSearch';

// Simple interface matching your API
interface SimpleProperty {
  id: string;
  title: string;
  description: string;
  type: string;
  category: string;
  price?: number;
  rentPrice?: number;
  city: string;
  state: string;
  bedrooms?: number;
  bathrooms?: number;
  images: string[];
  amenities: string[];
}

export default function SearchPage() {
  const { filters, updateFilters, resetFilters } = useSearch();
  const [properties, setProperties] = useState<SimpleProperty[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    const searchProperties = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        
        // Add only the filters that exist
        if (filters.q) params.set('query', filters.q);
        if (filters.type) params.set('type', filters.type);
        if (filters.category) params.set('category', filters.category);
        if (filters.city) params.set('city', filters.city);
        if (filters.state) params.set('state', filters.state);
        if (filters.minPrice) params.set('minPrice', filters.minPrice);
        if (filters.maxPrice) params.set('maxPrice', filters.maxPrice);
        if (filters.bedrooms) params.set('bedrooms', filters.bedrooms);

        const response = await fetch(`/api/properties/search?${params}`);
        const data = await response.json();
        
        if (data.success) {
          setProperties(data.data || []);
          setTotal(data.pagination?.total || 0);
        }
      } catch (error) {
        console.error('Search failed:', error);
        setProperties([]);
      } finally {
        setLoading(false);
      }
    };

    searchProperties();
  }, [filters]);

  // Simple property grid component
  const PropertyGrid = ({ properties }: { properties: SimpleProperty[] }) => {
    if (properties.length === 0) {
      return (
        <div className="text-center py-12">
          <div className="text-gray-500 text-lg">No properties found</div>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {properties.map((property) => (
          <div key={property.id} className="border rounded-lg overflow-hidden shadow-sm">
            <div className="aspect-video bg-gray-200">
              {property.images && property.images.length > 0 ? (
                <img 
                  src={property.images[0]} 
                  alt={property.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gray-300 flex items-center justify-center">
                  <span className="text-gray-500">No Image</span>
                </div>
              )}
            </div>
            <div className="p-4">
              <h3 className="font-semibold text-lg mb-2">{property.title}</h3>
              <p className="text-gray-600 text-sm mb-2">{property.city}, {property.state}</p>
              <p className="font-bold text-blue-600">
                {property.category === 'RENT' ? '$' + (property.rentPrice || 0) + '/month' : '$' + (property.price || 0)}
              </p>
            </div>
          </div>
        ))}
      </div>
    );
  };

  // Simple filters component
  const PropertyFilters = () => {
    return (
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold">Filters</h3>
          <button 
            onClick={resetFilters}
            className="px-3 py-1 border border-gray-300 rounded text-sm hover:bg-gray-50"
          >
            Reset
          </button>
        </div>

        <div className="space-y-4">
          {/* Property Type */}
          <div>
            <label className="block text-sm font-medium mb-2">Property Type</label>
            <select 
              value={filters.type || ''}
              onChange={(e) => updateFilters({ type: e.target.value })}
              className="w-full p-2 border border-gray-300 rounded"
            >
              <option value="">All Types</option>
              <option value="APARTMENT">Apartment</option>
              <option value="HOUSE">House</option>
              <option value="VILLA">Villa</option>
            </select>
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium mb-2">Category</label>
            <select 
              value={filters.category || ''}
              onChange={(e) => updateFilters({ category: e.target.value })}
              className="w-full p-2 border border-gray-300 rounded"
            >
              <option value="">All Categories</option>
              <option value="SALE">For Sale</option>
              <option value="RENT">For Rent</option>
            </select>
          </div>

          {/* City */}
          <div>
            <label className="block text-sm font-medium mb-2">City</label>
            <input
              type="text"
              placeholder="Enter city"
              value={filters.city || ''}
              onChange={(e) => updateFilters({ city: e.target.value })}
              className="w-full p-2 border border-gray-300 rounded"
            />
          </div>

          {/* Price Range */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-sm font-medium mb-2">Min Price</label>
              <input
                type="number"
                placeholder="Min"
                value={filters.minPrice || ''}
                onChange={(e) => updateFilters({ minPrice: e.target.value })}
                className="w-full p-2 border border-gray-300 rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Max Price</label>
              <input
                type="number"
                placeholder="Max"
                value={filters.maxPrice || ''}
                onChange={(e) => updateFilters({ maxPrice: e.target.value })}
                className="w-full p-2 border border-gray-300 rounded"
              />
            </div>
          </div>

          {/* Bedrooms */}
          <div>
            <label className="block text-sm font-medium mb-2">Bedrooms</label>
            <select 
              value={filters.bedrooms || ''}
              onChange={(e) => updateFilters({ bedrooms: e.target.value })}
              className="w-full p-2 border border-gray-300 rounded"
            >
              <option value="">Any</option>
              <option value="1">1+</option>
              <option value="2">2+</option>
              <option value="3">3+</option>
              <option value="4">4+</option>
            </select>
          </div>
        </div>
      </div>
    );
  };

  // Search input component
  const SearchInput = () => {
    const [searchQuery, setSearchQuery] = useState(filters.q || '');

    const handleSearch = (e: React.FormEvent) => {
      e.preventDefault();
      updateFilters({ q: searchQuery });
    };

    return (
      <form onSubmit={handleSearch} className="mb-6">
        <div className="flex gap-2 max-w-2xl">
          <input
            type="text"
            placeholder="Search by location, property, or keyword..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Search
          </button>
        </div>
      </form>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {filters.q ? `Search results for "${filters.q}"` : 'Find Your Perfect Property'}
          </h1>
          <p className="text-gray-600">
            {total > 0 ? `${total} properties found` : 'No properties found matching your criteria'}
          </p>
        </div>

        {/* Search Input */}
        <SearchInput />

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <PropertyFilters />
          </div>

          {/* Results */}
          <div className="lg:col-span-3">
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              <PropertyGrid properties={properties} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

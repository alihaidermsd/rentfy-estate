'use client';

import { useProperties } from '@/hooks/useProperties';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import { ErrorMessage } from '@/components/shared/ErrorMessage';
import { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  MapPin, 
  Bed, 
  Bath, 
  Square, 
  Star, 
  Heart,
  Eye,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatPrice } from '@/lib/utils';
import Link from 'next/link';

// Define a minimal property type that matches what we actually use in the component
interface DisplayProperty {
  id: string;
  title: string;
  description: string;
  type: string;
  category: 'RENT' | 'SALE';
  price: number | null;
  rentPrice: number | null;
  address: string;
  city: string;
  state: string;
  country: string;
  bedrooms: number | null;
  bathrooms: number | null;
  area: number | null;
  images: string[];
  amenities: string[];
  averageRating: number | null;
  featured: boolean;
  purpose?: string;
  isFavorite?: boolean;
  status?: string;
  isActive?: boolean;
}

export default function PropertiesPage() {
  const {
    properties,
    isLoading,
    error,
    filters,
    updateFilters,
    pagination,
    setPage,
  } = useProperties();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [priceRange, setPriceRange] = useState([0, 10000000]);
  const [bedrooms, setBedrooms] = useState<number | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [filteredProperties, setFilteredProperties] = useState<DisplayProperty[]>([]);
  const [totalProperties, setTotalProperties] = useState<DisplayProperty[]>([]);

  // Update filters when component mounts to fetch ALL properties
  useEffect(() => {
    updateFilters({ 
      limit: 100, // Increase limit to get more properties
      sortBy: 'createdAt',
      sortOrder: 'desc',
      // Add these to match home page criteria
      status: 'PUBLISHED',
      
    });
  }, []);

  // Transform properties to DisplayProperty format
  useEffect(() => {
    if (!properties || !Array.isArray(properties)) {
      setFilteredProperties([]);
      setTotalProperties([]);
      return;
    }

    // Transform the properties to match our DisplayProperty interface
    const displayProperties: DisplayProperty[] = properties.map((prop: any) => ({
      id: prop.id || '',
      title: prop.title || '',
      description: prop.description || '',
      type: prop.type || '',
      category: prop.category || 'SALE',
      price: prop.price ?? null,
      rentPrice: prop.rentPrice ?? null,
      address: prop.address || '',
      city: prop.city || '',
      state: prop.state || '',
      country: prop.country || '',
      bedrooms: prop.bedrooms ?? null,
      bathrooms: prop.bathrooms ?? null,
      area: prop.area ?? null,
      images: Array.isArray(prop.images) ? prop.images : [],
      amenities: Array.isArray(prop.amenities) ? prop.amenities : [],
      averageRating: prop.averageRating ?? null,
      featured: prop.featured || false,
      purpose: prop.purpose,
      isFavorite: prop.isFavorite || false,
      status: prop.status,
      isActive: prop.isActive,
    }));

    // Save all properties for debugging
    setTotalProperties(displayProperties);
    
    let result = [...displayProperties];

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(property =>
        property.title?.toLowerCase().includes(query) ||
        property.description?.toLowerCase().includes(query) ||
        property.city?.toLowerCase().includes(query) ||
        property.address?.toLowerCase().includes(query)
      );
    }

    // Apply type filter
    if (selectedType !== 'all') {
      result = result.filter(property => property.type === selectedType);
    }

    // Apply category filter
    if (selectedCategory !== 'all') {
      result = result.filter(property => property.category === selectedCategory);
    }

    // FIXED: Apply price filter - only filter if price exists
    result = result.filter(property => {
      const price = property.category === 'SALE' ? property.price : property.rentPrice;
      // Check if price exists
      if (price === null || price === undefined) {
        // Include properties without prices (don't filter them out)
        return true;
      }
      return price >= priceRange[0] && price <= priceRange[1];
    });

    // Apply bedrooms filter
    if (bedrooms !== null) {
      result = result.filter(property => 
        property.bedrooms !== null && property.bedrooms >= bedrooms
      );
    }

    setFilteredProperties(result);
    
    // Debug logging
    console.log('Total properties from API:', properties.length);
    console.log('Properties after transformation:', displayProperties.length);
    console.log('Properties after filtering:', result.length);
  }, [properties, searchQuery, selectedType, selectedCategory, priceRange, bedrooms]);

  const propertyTypes = [
    { value: 'all', label: 'All Types' },
    { value: 'APARTMENT', label: 'Apartment' },
    { value: 'HOUSE', label: 'House' },
    { value: 'VILLA', label: 'Villa' },
    { value: 'CONDO', label: 'Condo' },
    { value: 'TOWNHOUSE', label: 'Townhouse' },
    { value: 'COMMERCIAL', label: 'Commercial' },
    { value: 'LAND', label: 'Land' },
    { value: 'OFFICE', label: 'Office' },
    { value: 'RETAIL', label: 'Retail' },
    { value: 'INDUSTRIAL', label: 'Industrial' },
    { value: 'OTHER', label: 'Other' },
  ];

  const propertyCategories = [
    { value: 'all', label: 'All Categories' },
    { value: 'RENT', label: 'For Rent' },
    { value: 'SALE', label: 'For Sale' },
  ];

  const bedroomOptions = [
    { value: null, label: 'Any' },
    { value: 1, label: '1+' },
    { value: 2, label: '2+' },
    { value: 3, label: '3+' },
    { value: 4, label: '4+' },
    { value: 5, label: '5+' },
  ];

  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedType('all');
    setSelectedCategory('all');
    setPriceRange([0, 10000000]);
    setBedrooms(null);
  };

  const handleSearch = () => {
    // Update filters with search query
    updateFilters({ 
      search: searchQuery || undefined,
      type: selectedType !== 'all' ? selectedType : undefined,
      category: selectedCategory !== 'all' ? selectedCategory : undefined,
      // Only apply price filters if they're not at default values
      minPrice: priceRange[0] > 0 ? priceRange[0] : undefined,
      maxPrice: priceRange[1] < 10000000 ? priceRange[1] : undefined,
      bedrooms: bedrooms !== null ? bedrooms : undefined,
      page: 1, // Reset to first page
      // Ensure we always fetch published and active properties
      status: 'PUBLISHED',
    });
  };

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    let sortBy: "price" | "rentPrice" | "views" | "createdAt" | undefined = 'createdAt';
    let sortOrder: "desc" | "asc" | undefined = 'desc';
    
    switch(value) {
      case 'Price: Low to High':
        sortBy = filters.category === 'SALE' ? 'price' : 'rentPrice';
        sortOrder = 'asc';
        break;
      case 'Price: High to Low':
        sortBy = filters.category === 'SALE' ? 'price' : 'rentPrice';
        sortOrder = 'desc';
        break;
      case 'Most Popular':
        sortBy = 'views';
        sortOrder = 'desc';
        break;
      default:
        sortBy = 'createdAt';
        sortOrder = 'desc';
    }
    
    updateFilters({ sortBy, sortOrder, page: 1 });
  };

  if (error) {
    return <ErrorMessage message={error.message} />;
  }

  // Add a debug section (remove in production)
  const showDebug = false;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      
      {/* DEBUG INFO - REMOVE IN PRODUCTION */}
      {showDebug && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
          <div className="max-w-7xl mx-auto">
            <div className="flex">
              <div className="ml-3">
                <p className="text-sm text-yellow-700">
                  <strong>Debug Info:</strong><br />
                  Properties from API: {properties?.length || 0}<br />
                  Total after transform: {totalProperties.length}<br />
                  Filtered properties: {filteredProperties.length}<br />
                  Price range: ${priceRange[0]} - ${priceRange[1]}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-blue-600 to-purple-700 text-white">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative max-w-7xl mx-auto px-4 py-20 lg:py-24">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4">
              Browse All Properties
            </h1>
            <p className="text-lg md:text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              Showing {totalProperties.length} properties for rent, sale, and investment
            </p>
          </div>
        </div>
      </div>

      {/* Search and Filters Section */}
      <div className="max-w-7xl mx-auto px-4 -mt-8">
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-8">
          {/* Search Bar */}
          <div className="relative mb-6">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search by location, property type, or keywords..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
            />
            <button
              onClick={handleSearch}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              Search
            </button>
          </div>

          {/* Quick Filters */}
          <div className="flex flex-wrap gap-3 mb-4">
            <Button
              variant={selectedCategory === 'all' ? "default" : "outline"}
              onClick={() => {
                setSelectedCategory('all');
                setTimeout(() => handleSearch(), 0);
              }}
              className="rounded-full"
            >
              All Properties
            </Button>
            <Button
              variant={selectedCategory === 'RENT' ? "default" : "outline"}
              onClick={() => {
                setSelectedCategory('RENT');
                setTimeout(() => handleSearch(), 0);
              }}
              className="rounded-full"
            >
              For Rent
            </Button>
            <Button
              variant={selectedCategory === 'SALE' ? "default" : "outline"}
              onClick={() => {
                setSelectedCategory('SALE');
                setTimeout(() => handleSearch(), 0);
              }}
              className="rounded-full"
            >
              For Sale
            </Button>
          </div>

          {/* Advanced Filters Toggle */}
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
            >
              <Filter className="h-4 w-4" />
              {showFilters ? 'Hide Filters' : 'Show More Filters'}
            </button>
            <button
              onClick={handleClearFilters}
              className="text-gray-500 hover:text-gray-700 text-sm"
            >
              Clear All
            </button>
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-xl mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Property Type</label>
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {propertyTypes.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Bedrooms</label>
                <select
                  value={bedrooms || ''}
                  onChange={(e) => setBedrooms(e.target.value ? parseInt(e.target.value) : null)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {bedroomOptions.map((option) => (
                    <option key={option.value || 'any'} value={option.value || ''}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Price Range: ${priceRange[0].toLocaleString()} - ${priceRange[1].toLocaleString()}
                </label>
                <div className="flex items-center gap-4">
                  <input
                    type="range"
                    min="0"
                    max="10000000"
                    step="10000"
                    value={priceRange[0]}
                    onChange={(e) => setPriceRange([parseInt(e.target.value), priceRange[1]])}
                    className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                  <span className="text-gray-500">to</span>
                  <input
                    type="range"
                    min="0"
                    max="10000000"
                    step="10000"
                    value={priceRange[1]}
                    onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                    className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Apply Filters Button */}
          {showFilters && (
            <div className="flex justify-end mb-4">
              <Button onClick={handleSearch} className="bg-blue-600 hover:bg-blue-700">
                Apply Filters
              </Button>
            </div>
          )}

          {/* Results Count */}
          <div className="flex items-center justify-between">
            <p className="text-gray-600">
              Showing <span className="font-semibold">{filteredProperties.length}</span> of <span className="font-semibold">{totalProperties.length}</span> properties
              {searchQuery && ` for "${searchQuery}"`}
            </p>
            <div className="flex items-center gap-2">
              <select 
                onChange={handleSortChange}
                className="border border-gray-300 rounded-lg px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option>Sort by: Newest</option>
                <option>Price: Low to High</option>
                <option>Price: High to Low</option>
                <option>Most Popular</option>
              </select>
            </div>
          </div>
        </div>

        {/* Properties Grid */}
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <LoadingSpinner />
          </div>
        ) : filteredProperties.length === 0 ? (
          <div className="text-center py-16">
            <div className="mx-auto w-24 h-24 text-gray-300 mb-4">
              <Search className="w-full h-full" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No properties found</h3>
            <p className="text-gray-600 mb-6">
              {totalProperties.length === 0 ? 
                "No properties available in the database." : 
                "Try adjusting your search or filters to find what you're looking for."
              }
            </p>
            {totalProperties.length > 0 && (
              <Button onClick={handleClearFilters}>Clear All Filters</Button>
            )}
          </div>
        ) : (
          <>
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-50 rounded-lg">
                    <Bed className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Total Properties</p>
                    <p className="text-2xl font-bold text-gray-900">{totalProperties.length}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-50 rounded-lg">
                    <Bed className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">For Rent</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {totalProperties.filter(p => p.category === 'RENT').length}
                    </p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-50 rounded-lg">
                    <Bed className="h-6 w-6 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">For Sale</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {totalProperties.filter(p => p.category === 'SALE').length}
                    </p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-amber-50 rounded-lg">
                    <Star className="h-6 w-6 text-amber-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Featured</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {totalProperties.filter(p => p.featured).length}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Properties Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12">
              {filteredProperties.map((property) => {
                // Get the display price based on category
                const displayPrice = property.category === 'RENT' 
                  ? property.rentPrice 
                  : property.price;
                
                // Get the price text
                const priceText = property.category === 'RENT'
                  ? property.rentPrice ? `${formatPrice(property.rentPrice)}/mo` : 'Price on request'
                  : property.price ? formatPrice(property.price) : 'Price on request';

                return (
                  <div
                    key={property.id}
                    className="group bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100"
                  >
                    {/* Image Section */}
                    <div className="relative h-56 overflow-hidden">
                      {property.images && property.images.length > 0 ? (
                        <img
                          src={property.images[0]}
                          alt={property.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
                          <div className="text-center">
                            <Bed className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                            <p className="text-gray-500">No Image</p>
                          </div>
                        </div>
                      )}
                      
                      {/* Badges */}
                      <div className="absolute top-3 left-3 flex flex-col gap-1">
                        {property.featured && (
                          <span className="bg-amber-500 text-white text-xs font-semibold px-2 py-1 rounded-full">
                            Featured
                          </span>
                        )}
                        {property.category === 'RENT' && (
                          <span className="bg-green-500 text-white text-xs font-semibold px-2 py-1 rounded-full">
                            For Rent
                          </span>
                        )}
                        {property.category === 'SALE' && (
                          <span className="bg-blue-500 text-white text-xs font-semibold px-2 py-1 rounded-full">
                            For Sale
                          </span>
                        )}
                      </div>

                      {/* Favorite Button */}
                      <button className="absolute top-3 right-3 p-2 bg-white/90 rounded-full hover:bg-white transition-colors">
                        <Heart className="h-4 w-4 text-gray-600" />
                      </button>

                      {/* Price Tag - Always show, even if price is null */}
                      <div className="absolute bottom-3 left-3 bg-white/95 backdrop-blur-sm rounded-xl px-3 py-1.5 shadow-lg">
                        <div className="text-base font-bold text-gray-900">
                          {priceText}
                        </div>
                      </div>
                    </div>

                    {/* Content Section */}
                    <div className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <h3 className="text-lg font-bold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors line-clamp-1">
                            {property.title}
                          </h3>
                          <div className="flex items-center text-gray-600 text-sm">
                            <MapPin className="h-3 w-3 mr-1 flex-shrink-0" />
                            <span className="truncate">{property.city}, {property.state}</span>
                          </div>
                        </div>
                        {property.averageRating && (
                          <div className="flex items-center bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded-lg ml-2 flex-shrink-0">
                            <Star className="h-3 w-3 fill-current mr-0.5" />
                            <span className="font-semibold text-sm">{property.averageRating.toFixed(1)}</span>
                          </div>
                        )}
                      </div>

                      <p className="text-gray-600 text-sm mb-3 line-clamp-2 h-10">
                        {property.description}
                      </p>

                      {/* Property Features */}
                      <div className="grid grid-cols-3 gap-2 py-3 border-y border-gray-100 mb-3">
                        <div className="text-center">
                          <div className="flex items-center justify-center gap-1 text-gray-700 mb-0.5">
                            <Bed className="h-3.5 w-3.5" />
                            <span className="font-semibold text-sm">{property.bedrooms || 'N/A'}</span>
                          </div>
                          <div className="text-xs text-gray-500">Bed</div>
                        </div>
                        <div className="text-center">
                          <div className="flex items-center justify-center gap-1 text-gray-700 mb-0.5">
                            <Bath className="h-3.5 w-3.5" />
                            <span className="font-semibold text-sm">{property.bathrooms || 'N/A'}</span>
                          </div>
                          <div className="text-xs text-gray-500">Bath</div>
                        </div>
                        <div className="text-center">
                          <div className="flex items-center justify-center gap-1 text-gray-700 mb-0.5">
                            <Square className="h-3.5 w-3.5" />
                            <span className="font-semibold text-sm">
                              {property.area?.toLocaleString() || 'N/A'}
                            </span>
                          </div>
                          <div className="text-xs text-gray-500">Sq Ft</div>
                        </div>
                      </div>

                      {/* Property Type and Actions */}
                      <div className="flex items-center justify-between">
                        <span className="px-2 py-0.5 bg-gray-100 text-gray-700 text-xs rounded-full truncate max-w-[100px]">
                          {property.type?.toLowerCase().replace('_', ' ')}
                        </span>
                        <div className="flex items-center gap-1">
                          <Link href={`/properties/${property.id}`}>
                            <Button variant="outline" size="sm" className="rounded-full h-8 text-xs px-2">
                              <Eye className="h-3 w-3 mr-1" />
                              View
                            </Button>
                          </Link>
                          <Link href={`/properties/${property.id}/book`}>
                            <Button size="sm" className="rounded-full h-8 text-xs px-2">
                              {property.category === 'RENT' ? 'Book' : 'Inquire'}
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pagination */}
            {pagination && pagination.pages > 1 && (
              <div className="flex justify-center mb-12">
                <nav className="flex items-center gap-2">
                  <button 
                    onClick={() => setPage(pagination.page - 1)}
                    disabled={pagination.page === 1}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Previous
                  </button>
                  
                  {Array.from({ length: Math.min(5, pagination.pages) }, (_, i) => {
                    let pageNum;
                    if (pagination.pages <= 5) {
                      pageNum = i + 1;
                    } else if (pagination.page <= 3) {
                      pageNum = i + 1;
                    } else if (pagination.page >= pagination.pages - 2) {
                      pageNum = pagination.pages - 4 + i;
                    } else {
                      pageNum = pagination.page - 2 + i;
                    }
                    
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setPage(pageNum)}
                        className={`px-4 py-2 border rounded-lg ${
                          pagination.page === pageNum
                            ? 'bg-blue-600 text-white border-blue-600'
                            : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                  
                  <button 
                    onClick={() => setPage(pagination.page + 1)}
                    disabled={pagination.page === pagination.pages}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                  >
                    Next
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </nav>
              </div>
            )}
          </>
        )}

        {/* Call to Action */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-700 rounded-2xl p-8 text-center text-white mb-12">
          <h2 className="text-3xl font-bold mb-4">Can't find what you're looking for?</h2>
          <p className="text-lg text-blue-100 mb-6">
            Let us help you find your perfect property. Our agents are ready to assist you.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary" className="rounded-full">
              Contact an Agent
            </Button>
            <Button size="lg" variant="outline" className="rounded-full border-white text-white hover:bg-white/10">
              Schedule a Tour
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
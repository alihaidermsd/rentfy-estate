'use client';

import { useProperties } from '@/hooks/useProperties';
import { PropertyGrid } from '@/components/property/PropertyGrid';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import { ErrorMessage } from '@/components/shared/ErrorMessage';

export default function PropertiesPage() {
  const {
    properties,
    isLoading,
    error,
    filters,
    updateFilters,
  } = useProperties();

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">All Properties</h1>
          <p className="text-gray-600">Discover our complete collection of properties</p>
        </div>

        {/* Filters */}
        <div className="bg-white p-6 rounded-lg shadow mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <select className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option>Property Type</option>
              <option>House</option>
              <option>Apartment</option>
              <option>Villa</option>
              <option>Commercial</option>
            </select>
            <select className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option>Price Range</option>
              <option>$0 - $100,000</option>
              <option>$100,000 - $300,000</option>
              <option>$300,000 - $500,000</option>
              <option>$500,000+</option>
            </select>
            <select className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option>Bedrooms</option>
              <option>1</option>
              <option>2</option>
              <option>3</option>
              <option>4+</option>
            </select>
            <button className="bg-blue-600 text-white rounded px-4 py-2 hover:bg-blue-700 transition font-semibold">
              Apply Filters
            </button>
          </div>
        </div>

        {/* Properties Grid */}
        {isLoading ? (
          <LoadingSpinner />
        ) : error ? (
          <ErrorMessage message={error.message} />
        ) : (
          <PropertyGrid properties={properties} />
        )}
      </div>
    </div>
  );
}
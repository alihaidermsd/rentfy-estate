// components/properties/PropertiesHeader.tsx
import { Search } from 'lucide-react';
import Link from 'next/link';

export default function PropertiesHeader() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-bold text-gray-900">Find Your Perfect Property</h1>
        <p className="mt-2 text-lg text-gray-600">
          Discover amazing properties for rent, sale, and booking
        </p>
      </div>

      {/* Quick Search Bar */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
        <input
          type="text"
          placeholder="Search properties by name, location, or amenities..."
          className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      {/* Quick Links */}
      <div className="flex flex-wrap gap-4">
        <Link
          href="/properties?category=RENT"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          For Rent
        </Link>
        <Link
          href="/properties?category=SALE"
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          For Sale
        </Link>
        <Link
          href="/properties?category=BOOKING"
          className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
        >
          For Booking
        </Link>
        <Link
          href="/properties?type=HOUSE"
          className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
        >
          Houses
        </Link>
        <Link
          href="/properties?type=APARTMENT"
          className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
        >
          Apartments
        </Link>
        <Link
          href="/properties?type=VILLA"
          className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
        >
          Villas
        </Link>
      </div>
    </div>
  );
}
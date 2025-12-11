'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Home, Building, Hotel, Warehouse, Trees, Building2, Store, Factory } from 'lucide-react';

import { Card, CardContent } from '@/components/ui/card';

const propertyTypes = [
  {
    id: 'apartment',
    name: 'Apartments',
    icon: Building,
    count: 245,
    color: 'bg-blue-100 text-blue-600',
    description: 'Modern apartments in prime locations',
  },
  {
    id: 'house',
    name: 'Houses',
    icon: Home,
    count: 189,
    color: 'bg-green-100 text-green-600',
    description: 'Family homes with spacious layouts',
  },
  {
    id: 'villa',
    name: 'Villas',
    icon: Hotel,
    count: 67,
    color: 'bg-purple-100 text-purple-600',
    description: 'Luxury villas with premium amenities',
  },
  {
    id: 'condo',
    name: 'Condos',
    icon: Building2,
    count: 134,
    color: 'bg-orange-100 text-orange-600',
    description: 'Contemporary condominium living',
  },
  {
    id: 'commercial',
    name: 'Commercial',
    icon: Store,
    count: 89,
    color: 'bg-red-100 text-red-600',
    description: 'Office spaces and retail outlets',
  },
  {
    id: 'land',
    name: 'Land',
    icon: Trees,
    count: 156,
    color: 'bg-yellow-100 text-yellow-600',
    description: 'Plots for development and investment',
  },
  {
    id: 'industrial',
    name: 'Industrial',
    icon: Factory,
    count: 45,
    color: 'bg-gray-100 text-gray-600',
    description: 'Warehouses and manufacturing spaces',
  },
  {
    id: 'townhouse',
    name: 'Townhouses',
    icon: Building,
    count: 78,
    color: 'bg-indigo-100 text-indigo-600',
    description: 'Modern townhouse communities',
  },
];

export default function PropertyTypesGrid() {
  const [hoveredType, setHoveredType] = useState<string | null>(null);

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {propertyTypes.map((type) => {
        const Icon = type.icon;
        return (
          <Link key={type.id} href={`/properties?type=${type.id.toUpperCase()}`}>
            <Card
              className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer"
              onMouseEnter={() => setHoveredType(type.id)}
              onMouseLeave={() => setHoveredType(null)}
            >
              <CardContent className="p-6">
                <div className="flex flex-col items-center text-center">
                  <div className={`p-3 rounded-full ${type.color} mb-4 transition-transform group-hover:scale-110`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">{type.name}</h3>
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                    {type.description}
                  </p>
                  <div className="text-sm font-medium text-blue-600">
                    {type.count} properties
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        );
      })}
    </div>
  );
}
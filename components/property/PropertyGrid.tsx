
"use client";
import Link from 'next/link';
import Image from 'next/image';
import { MapPin, Bed, Bath, Square, Star, Heart } from 'lucide-react';

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Property } from '@/hooks/useProperties'; // Correct import
import { formatPrice } from '@/utils/price';

interface PropertyGridProps {
  properties: Property[];
  className?: string;
}

export function PropertyGrid({ properties, className = '' }: PropertyGridProps) {
  if (properties.length === 0) {
    return <p>No properties found.</p>;
  }
  
  return (
    <div
      className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 ${className}`}
    >
      {properties.map(property => (
        <PropertyCard key={property.id} property={property} />
      ))}
    </div>
  );
}

function PropertyCard({ property }: { property: Property }) {
  const displayPrice = property.category === 'RENT' ? property.rentPrice : property.price;
  const image = Array.isArray(property.images) && property.images.length > 0 ? property.images[0] : '/placeholder-property.jpg';

  return (
    <Card className="group overflow-hidden transition-all duration-300 hover:shadow-xl flex flex-col">
      <Link href={`/properties/${property.id}`} className="flex-shrink-0">
        <div className="relative aspect-[4/3] overflow-hidden">
          <Image
            src={image as string}
            alt={property.title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />

          {/* Favorite Button */}
          <Button
            variant="secondary"
            size="icon"
            className="absolute top-3 right-3 h-8 w-8 rounded-full bg-white/90 hover:bg-white"
            onClick={e => {
              e.preventDefault();
              // Handle favorite logic
              console.log('Toggling favorite for:', property.id);
            }}
          >
            <Heart
              className={`h-4 w-4 ${
                property.isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-500'
              }`}
            />
          </Button>

          {/* Badges */}
          <div className="absolute top-3 left-3 flex gap-2">
            {property.featured && (
              <Badge className="bg-blue-600 hover:bg-blue-700 text-white">Featured</Badge>
            )}
            <Badge variant="secondary" className="capitalize">
              {property.type.toLowerCase().replace('_', ' ')}
            </Badge>
          </div>
        </div>
      </Link>

      <CardContent className="p-4 flex flex-col flex-grow">
        <Link href={`/properties/${property.id}`} className="flex-grow">
          <h3 className="font-semibold text-lg mb-2 line-clamp-1 group-hover:text-blue-600 transition-colors">
            {property.title}
          </h3>
        </Link>

        <div className="flex items-center text-gray-600 mb-3">
          <MapPin className="h-4 w-4 mr-1 flex-shrink-0" />
          <span className="text-sm truncate">
            {property.city}, {property.state}
          </span>
        </div>

        <div className="flex items-center justify-between mb-4 mt-auto">
          <div className="text-2xl font-bold text-gray-900">
            {formatPrice(displayPrice || 0)}{' '}
            {property.category === 'RENT' && <span className="text-sm font-normal">/month</span>}
          </div>

          {property.averageRating > 0 && (
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              <span className="text-sm font-medium">{property.averageRating.toFixed(1)}</span>
              <span className="text-sm text-gray-500">({property.totalReviews})</span>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between text-sm text-gray-600 border-t pt-3">
          <div className="flex items-center gap-1">
            <Bed className="h-4 w-4" />
            <span>{property.bedrooms || 0} bed</span>
          </div>

          <div className="flex items-center gap-1">
            <Bath className="h-4 w-4" />
            <span>{property.bathrooms || 0} bath</span>
          </div>

          {property.area && (
            <div className="flex items-center gap-1">
              <Square className="h-4 w-4" />
              <span>{property.area} sqft</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
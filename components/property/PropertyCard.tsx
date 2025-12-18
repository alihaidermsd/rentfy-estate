// components/properties/PropertyCard.tsx
'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Heart, MapPin, Star, Bed, Bath, Maximize, Calendar } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

interface PropertyCardProps {
  property: any;
  onBookClick?: () => void; // New optional prop
}

export default function PropertyCard({ property, onBookClick }: PropertyCardProps) {
  const [isFavorite, setIsFavorite] = useState(false);

  let images: string[] = [];
  if (typeof property.images === 'string') {
    try {
      let parsed = JSON.parse(property.images);
      // Check if it's a stringified array of stringified arrays (double stringified)
      if (Array.isArray(parsed) && parsed.length > 0 && typeof parsed[0] === 'string' && parsed[0].startsWith('["')) {
        images = parsed.flatMap((item: string) => {
          try {
            return JSON.parse(item);
          } catch {
            return item;
          }
        });
      } else if (Array.isArray(parsed)) {
        images = parsed;
      } else {
        images = property.images.split(',').filter(Boolean);
      }
    } catch (error) {
      images = property.images.split(',').filter(Boolean);
    }
  } else if (Array.isArray(property.images)) {
    images = property.images;
  }

  const amenities = property.amenities ? property.amenities.split(',').slice(0, 3) : [];

  // Safely calculate average rating with default fallback
  const reviews = Array.isArray(property.reviews) ? property.reviews : [];
  const avgRating = reviews.length > 0
    ? reviews.reduce((sum: number, review: any) => sum + review.rating, 0) / reviews.length
    : 0;

  // Safely get booking status with default fallback
  const bookings = Array.isArray(property.bookings) ? property.bookings : [];
  const hasActiveBooking = bookings.length > 0;
  
  let nextAvailableDate = null;
  if (hasActiveBooking) {
    const endDates = bookings
      .filter((b: any) => b.endDate)
      .map((b: any) => new Date(b.endDate).getTime());
    
    if (endDates.length > 0) {
      const maxEndDate = new Date(Math.max(...endDates));
      nextAvailableDate = maxEndDate.toLocaleDateString();
    }
  }

  // Determine price display based on category
  const getPriceDisplay = () => {
    switch (property.category) {
      case 'RENT':
        return `${formatCurrency(property.rentPrice || 0)}/month`;
      case 'BOOKING':
        return `${formatCurrency(property.bookingPrice || 0)}/night`;
      case 'SALE':
        return formatCurrency(property.price || 0);
      default:
        return 'Price on request';
    }
  };

  // Get category badge color
  const getCategoryColor = () => {
    switch (property.category) {
      case 'RENT':
        return 'bg-blue-100 text-blue-800';
      case 'SALE':
        return 'bg-green-100 text-green-800';
      case 'BOOKING':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Get type badge
  const getTypeBadge = () => {
    const types: Record<string, string> = {
      HOUSE: '🏠 House',
      APARTMENT: '🏢 Apartment',
      VILLA: '🏰 Villa',
      CONDO: '🏘️ Condo',
      TOWNHOUSE: '🏘️ Townhouse',
      STUDIO: '🎨 Studio',
      COMMERCIAL: '🏢 Commercial',
      LAND: '🌳 Land',
    };
    return types[property.type] || property.type;
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
      {/* Image Section */}
      <div className="relative h-64">
        {images.length > 0 ? (
          <Image
            src={images[0]}
            alt={property.title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div className="w-full h-full bg-gray-200 flex items-center justify-center">
            <span className="text-gray-400 text-4xl">🏠</span>
          </div>
        )}
        
        {/* Favorite Button */}
        <button
          onClick={() => setIsFavorite(!isFavorite)}
          className="absolute top-4 right-4 p-2 bg-white rounded-full shadow-md hover:bg-gray-100 transition-colors"
        >
          <Heart 
            className={`h-5 w-5 ${isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-400'}`} 
          />
        </button>

        {/* Category Badge */}
        <div className="absolute top-4 left-4">
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getCategoryColor()}`}>
            {property.category}
          </span>
        </div>

        {/* Type Badge */}
        <div className="absolute bottom-4 left-4">
          <span className="px-3 py-1 bg-black/70 text-white rounded-full text-xs font-medium">
            {getTypeBadge()}
          </span>
        </div>

        {/* Image Count */}
        {images.length > 1 && (
          <div className="absolute bottom-4 right-4 px-2 py-1 bg-black/70 text-white rounded text-xs">
            +{images.length - 1}
          </div>
        )}
      </div>

      {/* Content Section */}
      <div className="p-6">
        {/* Price */}
        <div className="flex items-center justify-between mb-2">
          <span className="text-2xl font-bold text-gray-900">
            {getPriceDisplay()}
          </span>
          {hasActiveBooking && nextAvailableDate && (
            <div className="flex items-center text-sm text-amber-600">
              <Calendar className="h-4 w-4 mr-1" />
              Available from {nextAvailableDate}
            </div>
          )}
        </div>

        {/* Title and Location */}
        <h3 className="text-lg font-semibold text-gray-900 mb-1">
          <Link href={`/properties/${property.id}`} className="hover:text-blue-600">
            {property.title}
          </Link>
        </h3>
        
        <div className="flex items-center text-gray-600 mb-4">
          <MapPin className="h-4 w-4 mr-1" />
          <span className="text-sm truncate">
            {property.address}, {property.city}, {property.state}
          </span>
        </div>

        {/* Rating */}
        {reviews.length > 0 && (
          <div className="flex items-center mb-4">
            <div className="flex items-center">
              <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
              <span className="ml-1 font-medium">{avgRating.toFixed(1)}</span>
            </div>
            <span className="mx-2 text-gray-300">•</span>
            <span className="text-sm text-gray-600">
              {reviews.length} review{reviews.length !== 1 ? 's' : ''}
            </span>
          </div>
        )}

        {/* Property Details */}
        <div className="flex items-center justify-between border-t border-b border-gray-200 py-4 mb-4">
          <div className="flex items-center">
            <Bed className="h-5 w-5 text-gray-500 mr-2" />
            <span className="text-gray-700">{property.bedrooms || 0} beds</span>
          </div>
          <div className="flex items-center">
            <Bath className="h-5 w-5 text-gray-500 mr-2" />
            <span className="text-gray-700">{property.bathrooms || 0} baths</span>
          </div>
          <div className="flex items-center">
            <Maximize className="h-5 w-5 text-gray-500 mr-2" />
            <span className="text-gray-700">{property.area || 0} sqft</span>
          </div>
        </div>

        {/* Amenities */}
        {amenities.length > 0 && (
          <div className="mb-4">
            <p className="text-sm text-gray-600 mb-2">Amenities:</p>
            <div className="flex flex-wrap gap-2">
              {amenities.map((amenity: string) => (
                <span
                  key={amenity}
                  className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs"
                >
                  {amenity}
                </span>
              ))}
              {property.amenities && property.amenities.split(',').length > 3 && (
                <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                  +{property.amenities.split(',').length - 3} more
                </span>
              )}
            </div>
          </div>
        )}

        {/* Host/Agency Info */}
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-8 h-8 rounded-full bg-gray-300 mr-3 overflow-hidden">
              {property.user?.image ? (
                <Image
                  src={property.user.image}
                  alt={property.user.name || 'Host'}
                  width={32}
                  height={32}
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-600">
                  {property.user?.name?.charAt(0) || 'H'}
                </div>
              )}
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">
                {property.user?.name || 'Unknown Host'}
              </p>
              <p className="text-xs text-gray-600">
                {property.agent?.company ? `via ${property.agent.company}` : 'Direct'}
              </p>
            </div>
          </div>

          {/* View Details Button */}
          <Link
            href={`/properties/${property.id}`}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
          >
            View Details
          </Link>
          {onBookClick && (
            <button
              onClick={onBookClick}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium ml-2"
            >
              Book Now
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
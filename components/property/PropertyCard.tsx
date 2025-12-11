'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Bed, Bath, Square, Star, MapPin, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardFooter } from '@/components/ui/card';

interface PropertyCardProps {
  property: {
    id: string;
    title: string;
    type: string;
    category: 'RENT' | 'SALE';
    price: number | null;
    rentPrice: number | null;
    city: string;
    state: string;
    bedrooms: number | null;
    bathrooms: number | null;
    area: number;
    areaUnit: string;
    images: string | null;
    featured: boolean;
    verified: boolean;
    averageRating: number | null;
    totalReviews: number;
    isFavorited?: boolean;
    _count?: {
      favorites: number;
      reviews: number;
    };
  };
}

export default function PropertyCard({ property }: PropertyCardProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const [isFavorite, setIsFavorite] = useState(property.isFavorited || false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!session) {
      router.push('/login');
      return;
    }

    if (isSubmitting) return;
    setIsSubmitting(true);

    const originalIsFavorite = isFavorite;
    setIsFavorite(!isFavorite);

    try {
      const method = !isFavorite ? 'POST' : 'DELETE';
      const res = await fetch(`/api/properties/${property.id}/favorite`, {
        method,
      });

      if (!res.ok) {
        throw new Error('Failed to update favorite status');
      }
    } catch (error) {
      console.error(error);
      setIsFavorite(originalIsFavorite);
    } finally {
      setIsSubmitting(false);
    }
  };

  const firstImage = property.images?.split(',')[0] || '';

  return (
    <Link href={`/properties/${property.id}`}>
      <Card className="group overflow-hidden hover:shadow-xl transition-all duration-300 h-full flex flex-col cursor-pointer">
        <div className="relative overflow-hidden h-48">
          {firstImage ? (
            <img
              src={firstImage}
              alt={property.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full bg-gray-200 flex items-center justify-center">
              <span className="text-gray-400">No Image</span>
            </div>
          )}
          
          <div className="absolute top-3 left-3 flex flex-col gap-1">
            {property.featured && (
              <Badge className="bg-yellow-500 hover:bg-yellow-600">Featured</Badge>
            )}
            {property.verified && (
              <Badge className="bg-green-500 hover:bg-green-600">Verified</Badge>
            )}
            <Badge className="bg-blue-500 hover:bg-blue-600">
              {property.category === 'RENT' ? 'For Rent' : 'For Sale'}
            </Badge>
          </div>
          
          <button 
            className="absolute top-3 right-3 p-2 bg-white/90 rounded-full hover:bg-white transition-colors disabled:opacity-50"
            onClick={handleFavorite}
            disabled={isSubmitting}
          >
            <Heart className={`h-5 w-5 ${isFavorite ? 'text-red-500 fill-red-500' : 'text-gray-600'}`} />
          </button>
        </div>
        
        <CardContent className="p-4 flex-grow">
          <div className="mb-3">
            <h3 className="font-semibold text-lg line-clamp-1 mb-1">{property.title}</h3>
            <div className="flex items-center text-gray-600 text-sm">
              <MapPin className="h-4 w-4 mr-1" />
              <span className="line-clamp-1">
                {property.city}, {property.state}
              </span>
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-2 mb-4">
            {property.bedrooms !== null && property.bedrooms !== undefined && (
              <div className="flex items-center text-sm text-gray-600">
                <Bed className="h-4 w-4 mr-1" />
                {property.bedrooms} {property.bedrooms === 1 ? 'Bed' : 'Beds'}
              </div>
            )}
            {property.bathrooms !== null && property.bathrooms !== undefined && (
              <div className="flex items-center text-sm text-gray-600">
                <Bath className="h-4 w-4 mr-1" />
                {property.bathrooms} {property.bathrooms === 1 ? 'Bath' : 'Baths'}
              </div>
            )}
            {property.area && (
              <div className="flex items-center text-sm text-gray-600">
                <Square className="h-4 w-4 mr-1" />
                {property.area} {property.areaUnit.toLowerCase()}
              </div>
            )}
          </div>
          
          <div className="mt-auto">
            <div className="flex items-center justify-between mb-2">
              <div className="text-lg font-bold text-blue-600">
                {property.category === 'RENT' ? (
                  <>
                    {property.rentPrice !== null ? `$${property.rentPrice.toLocaleString()}` : 'Price on request'}
                    <span className="text-sm font-normal text-gray-500">/month</span>
                  </>
                ) : (
                  <>{property.price !== null ? `$${property.price.toLocaleString()}` : 'Price on request'}</>
                )}
              </div>
              
              {property.averageRating !== null && property.averageRating !== undefined && (
                <div className="flex items-center">
                  <Star className="h-4 w-4 text-yellow-500 fill-current" />
                  <span className="ml-1 text-sm font-medium">
                    {property.averageRating.toFixed(1)}
                  </span>
                  <span className="text-xs text-gray-500 ml-1">
                    ({property.totalReviews})
                  </span>
                </div>
              )}
            </div>
            
            <div className="flex items-center text-sm text-gray-500">
              <div className="flex items-center mr-4">
                <Heart className="h-4 w-4 mr-1" />
                {property._count?.favorites || 0}
              </div>
              <div className="flex items-center">
                <span>⭐</span>
                {property._count?.reviews || 0} reviews
              </div>
            </div>
          </div>
        </CardContent>
        
        <CardFooter className="p-4 pt-0">
          <Button className="w-full" size="sm">
            {property.category === 'RENT' ? 'Book Now' : 'View Details'}
          </Button>
        </CardFooter>
      </Card>
    </Link>
  );
}
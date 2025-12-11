'use client';

import { useState } from 'react';
import Link from 'next/link';
import Slider from 'react-slick';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import PropertyCard from '@/components/property/PropertyCard';
import { Property } from '@/types/property';

import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

interface FeaturedPropertiesProps {
  initialProperties: Property[];
}

export default function FeaturedProperties({ initialProperties }: FeaturedPropertiesProps) {
  const [properties, setProperties] = useState<Property[]>(initialProperties);
  const [loading] = useState(false);
  const [activeTab, setActiveTab] = useState('all');

  const filterProperties = (type: string) => {
    setActiveTab(type);
    if (type === 'all') {
      setProperties(initialProperties);
    } else {
      const filtered = initialProperties.filter(prop => 
        type === 'rent' ? prop.category === 'RENT' : prop.category === 'SALE'
      );
      setProperties(filtered);
    }
  };

  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 4,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 3,
          slidesToScroll: 1,
          infinite: true,
          dots: true
        }
      },
      {
        breakpoint: 600,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 1,
          initialSlide: 2
        }
      },
      {
        breakpoint: 480,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1
        }
      }
    ]
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="overflow-hidden rounded-lg">
            <Skeleton className="h-48 w-full" />
            <div className="p-4">
              <Skeleton className="h-6 w-3/4 mb-2" />
              <Skeleton className="h-4 w-1/2 mb-4" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!properties.length) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-400 mb-4">No featured properties available</div>
        <Link href="/properties/new">
          <Button>List Your Property</Button>
        </Link>
      </div>
    );
  }

  return (
    <>
      <div className="flex justify-center mb-8">
        <div className="inline-flex rounded-lg border p-1 bg-white shadow-sm">
          <button
            onClick={() => filterProperties('all')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'all'
                ? 'bg-blue-600 text-white'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            All Properties
          </button>
          <button
            onClick={() => filterProperties('rent')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'rent'
                ? 'bg-blue-600 text-white'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            For Rent
          </button>
          <button
            onClick={() => filterProperties('sale')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'sale'
                ? 'bg-blue-600 text-white'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            For Sale
          </button>
        </div>
      </div>

      <div className="slick-carousel-container">
        <Slider {...settings}>
          {properties.map((property) => (
            <div key={property.id} className="p-2"> {/* Added padding for spacing */}
              <PropertyCard property={property} />
            </div>
          ))}
        </Slider>
      </div>
    </>
  );
}
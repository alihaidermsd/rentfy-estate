import { Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Search, MapPin, Bed, Bath, Square, Star, TrendingUp } from 'lucide-react';
import { PrismaClient } from '@prisma/client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import PropertyCard from '@/components/property/PropertyCard';
import PropertySearch from '@/components/property/PropertySearch';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import { Property } from '@/types/property';
import { PropertyMap } from '@/components/maps/PropertyMap'; // Import the new map component

// Components
import FeaturedProperties from './components/FeaturedProperties';
import PropertyTypesGrid from './components/PropertyTypesGrid';
import LocationHighlights from './components/LocationHighlights';
import StatsSection from './components/StatsSection';
import HowItWorks from './components/HowItWorks';
import Testimonials from './components/Testimonials';

import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

async function getFeaturedProperties() {
  try {
    const properties = await prisma.property.findMany({
      where: {
        featured: true,
        isActive: true,
        status: 'PUBLISHED',
        latitude: { not: null }, // Ensure property has latitude for map
        longitude: { not: null }, // Ensure property has longitude for map
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
        agent: {
          select: {
            id: true,
            user: {
              select: {
                name: true,
                image: true,
              },
            },
            company: true,
            licenseNumber: true,
            verified: true,
          },
        },
        developer: {
          select: {
            id: true,
            companyName: true,
            logo: true,
            verified: true,
          },
        },
        _count: {
          select: {
            reviews: { where: { status: 'APPROVED' } },
          },
        },
        reviews: {
          where: { status: 'APPROVED' },
          select: {
            rating: true,
          },
        },
      },
      orderBy: [
        { featuredUntil: 'desc' },
        { views: 'desc' },
        { createdAt: 'desc' },
      ],
      take: 8, // Take a few more to have enough for both sections
    });

    return properties.map((property: any) => {
      const { reviews, _count, ...rest } = property;
      const totalReviews = _count.reviews;
      const averageRating =
        totalReviews > 0
          ? reviews.reduce((sum: number, review: { rating: number }) => sum + review.rating, 0) / totalReviews
          : null;
      return { 
        ...rest, 
        averageRating, 
        totalReviews, 
        isFavorited: false,
        areaUnit: rest.areaUnit || 'SQFT', // Ensure areaUnit is set
      };
    });
  } catch (error) {
    console.error('Error fetching featured properties:', error);
    return [];
  }
}

async function getPropertyStats() {
  try {
    const [totalProperties, featuredProperties] = await Promise.all([
      prisma.property.count({ where: { status: 'PUBLISHED', isActive: true } }),
      prisma.property.count({ where: { featured: true, status: 'PUBLISHED', isActive: true } }),
    ]);
    return { totalProperties, featuredProperties };
  } catch (error) {
    console.error('Error fetching stats:', error);
    return { totalProperties: 0, featuredProperties: 0 };
  }
}

export default async function HomePage() {
  const [allFeaturedProperties, propertyStats] = await Promise.all([
    getFeaturedProperties(),
    getPropertyStats(),
  ]);

  // Take a subset of properties for the map, e.g., the first 5 with valid lat/lng
  const mapProperties = allFeaturedProperties
    .filter(p => p.latitude !== null && p.longitude !== null)
    .slice(0, 5)
    .map(p => ({
      id: p.id,
      title: p.title,
      category: p.category,
      rentPrice: p.rentPrice,
      price: p.price,
      city: p.city,
      state: p.state,
      images: (() => {
        const imgs: any = (p as any).images;
        if (!imgs) return [];
        if (typeof imgs === 'string') {
          const s = imgs.trim();
          if (s.startsWith('[')) {
            try {
              return JSON.parse(s);
            } catch {
              return s.replace(/^[\[]|[\]]$/g, '').split(',').map((x: any) => String(x).trim()).filter(Boolean);
            }
          }
          return s.split(',').map((x: any) => String(x).trim()).filter(Boolean);
        }
        return Array.isArray(imgs) ? imgs : [];
      })(),
      latitude: p.latitude as number,
      longitude: p.longitude as number,
    }));

  return (
    <div className="min-h-screen">
      {/* Hero Section - Interactive Map */}
      <section className="relative w-full h-[600px] md:h-[700px] overflow-hidden">
        <PropertyMap properties={mapProperties} className="absolute inset-0 w-full h-full" />
        
        <div className="absolute inset-0 bg-black/40 flex items-center justify-center p-4">
          <div className="max-w-4xl mx-auto text-center text-white z-10">
            <h1 className="text-4xl md:text-6xl font-extrabold mb-6 drop-shadow-lg">
              Find Your Dream <span className="text-yellow-300">Home</span> on the Map
            </h1>
            <p className="text-lg md:text-xl mb-8 text-blue-100 drop-shadow">
              Explore properties for rent, sale, and investment with our interactive map
            </p>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 md:p-6 shadow-2xl max-w-2xl mx-auto">
              <PropertySearch />
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <StatsSection stats={propertyStats} />

      {/* Featured Properties */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-10">
            <div>
              <h2 className="text-3xl font-bold text-gray-900">Featured Properties</h2>
              <p className="text-gray-600 mt-2">Discover our handpicked selection of premium properties</p>
            </div>
            <Link href="/properties">
              <Button variant="outline" className="group">
                View All Properties
                <TrendingUp className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>

          <Suspense fallback={<LoadingSpinner />}>
            <FeaturedProperties initialProperties={allFeaturedProperties} />
          </Suspense>
        </div>
      </section>

      {/* Property Types */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Browse By Property Type</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Explore properties based on your specific needs and preferences
            </p>
          </div>
          
          <PropertyTypesGrid />
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">How Rentfy Works</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Simple steps to find, book, or sell your property
            </p>
          </div>
          
          <HowItWorks />
        </div>
      </section>

      {/* Location Highlights */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Popular Locations</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Discover properties in the most sought-after neighborhoods
            </p>
          </div>
          
          <LocationHighlights />
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 bg-gray-900 text-white">
        <div className="container mx-auto px-4">
          <Testimonials />
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Find Your Dream Property?
          </h2>
          <p className="text-xl mb-8 text-blue-100 max-w-2xl mx-auto">
            Join thousands of satisfied customers who found their perfect home through Rentfy
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/properties">
              <Button size="lg" className="bg-white text-blue-600 hover:bg-blue-50">
                Browse Properties
              </Button>
            </Link>
            <Link href="/properties/new">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                List Your Property
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
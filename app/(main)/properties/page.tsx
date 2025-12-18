// app/properties/page.tsx
import { Suspense } from 'react';
import { getServerSession } from 'next-auth';
import PropertiesGrid from '@/components/property/PropertyGrid';
import PropertyFilters from '@/components/property/PropertyFilters';
import PropertiesHeader from '@/components/property/PropertyHeader';
import PropertyStats from '@/components/property/PropertyStats';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import LoadingSkeleton from '@/components/ui/LoadingSkeleton';

interface PropertiesPageProps {
  searchParams: {
    page?: string;
    limit?: string;
    type?: string;
    category?: string;
    minPrice?: string;
    maxPrice?: string;
    bedrooms?: string;
    bathrooms?: string;
    city?: string;
    state?: string;
    country?: string;
    amenities?: string;
    sortBy?: string;
    sortOrder?: string;
    search?: string;
  };
}

export default async function PropertiesPage({ searchParams }: PropertiesPageProps) {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <PropertiesHeader />

        {/* Property Statistics */}
        <Suspense fallback={<LoadingSkeleton className="h-32" />}>
          <PropertyStats userId={userId} />
        </Suspense>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 mt-8">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <Suspense fallback={<LoadingSkeleton className="h-screen" />}>
              <PropertyFilters />
            </Suspense>
          </div>

          {/* Properties Grid */}
          <div className="lg:col-span-3">
            <Suspense 
              fallback={
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {Array.from({ length: 9 }).map((_, i) => (
                    <LoadingSkeleton key={i} className="h-96" />
                  ))}
                </div>
              }
            >
              <PropertiesGrid searchParams={searchParams} userId={userId} />
            </Suspense>
          </div>
        </div>
      </div>
    </div>
  );
}
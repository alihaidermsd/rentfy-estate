// components/properties/PropertiesGrid.tsx
import { prisma } from '@/lib/prisma';
import PropertyCard from './PropertyCard';
import Pagination from '@/components/ui/Pagination';
import SortDropdown from './SortDropdown';

interface PropertiesGridProps {
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
  userId?: string;
}

export default async function PropertiesGrid({ searchParams, userId }: PropertiesGridProps) {
  const page = parseInt(searchParams.page || '1');
  const limit = parseInt(searchParams.limit || '12');
  const skip = (page - 1) * limit;

  // Build filter conditions
  const where: any = {
    status: 'PUBLISHED',
  };

  // Apply filters
  if (searchParams.type) where.type = searchParams.type;
  if (searchParams.category) where.category = searchParams.category;
  if (searchParams.city) where.city = { contains: searchParams.city, mode: 'insensitive' };
  if (searchParams.state) where.state = { contains: searchParams.state, mode: 'insensitive' };
  if (searchParams.country) where.country = { contains: searchParams.country, mode: 'insensitive' };
  
  // Price filters
  if (searchParams.minPrice || searchParams.maxPrice) {
    where.OR = [];
    
    if (searchParams.minPrice) {
      where.OR.push(
        { rentPrice: { gte: parseInt(searchParams.minPrice) } },
        { bookingPrice: { gte: parseInt(searchParams.minPrice) } },
        { price: { gte: parseInt(searchParams.minPrice) } }
      );
    }
    
    if (searchParams.maxPrice) {
      where.OR.push(
        { rentPrice: { lte: parseInt(searchParams.maxPrice) } },
        { bookingPrice: { lte: parseInt(searchParams.maxPrice) } },
        { price: { lte: parseInt(searchParams.maxPrice) } }
      );
    }
  }
  
  // Bedrooms & bathrooms
  if (searchParams.bedrooms) where.bedrooms = { gte: parseInt(searchParams.bedrooms) };
  if (searchParams.bathrooms) where.bathrooms = { gte: parseInt(searchParams.bathrooms) };
  
  // Amenities
  if (searchParams.amenities) {
    const amenities = searchParams.amenities.split(',');
    where.amenities = {
      contains: amenities.join(','),
    };
  }
  
  // Search
  if (searchParams.search) {
    where.OR = [
      { title: { contains: searchParams.search, mode: 'insensitive' } },
      { description: { contains: searchParams.search, mode: 'insensitive' } },
      { address: { contains: searchParams.search, mode: 'insensitive' } },
      { city: { contains: searchParams.search, mode: 'insensitive' } },
    ];
  }
  
  // User-specific properties (if logged in)
  if (userId) {
    where.OR = [
      ...(where.OR || []),
      { userId },
      { agentId: userId },
    ];
  }

  // Sort options
  const orderBy: any = {};
  const sortBy = searchParams.sortBy || 'createdAt';
  const sortOrder = searchParams.sortOrder || 'desc';
  orderBy[sortBy] = sortOrder;

  // Fetch properties and count
  const [properties, total] = await Promise.all([
    prisma.property.findMany({
      where,
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
          include: {
            user: {
              select: {
                name: true,
                email: true,
                phone: true,
              },
            },
          },
        },
        bookings: {
          where: {
            status: { in: ['CONFIRMED', 'CHECKED_IN'] },
            endDate: { gte: new Date() },
          },
          select: {
            id: true,
            startDate: true,
            endDate: true,
          },
        },
        reviews: {
          select: {
            rating: true,
          },
        },
      },
      orderBy,
      skip,
      take: limit,
    }),
    prisma.property.count({ where }),
  ]);

  const totalPages = Math.ceil(total / limit);

  if (properties.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-400 text-6xl mb-4">🏠</div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">No properties found</h3>
        <p className="text-gray-600">Try adjusting your filters to find what you're looking for.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Results header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            {total} Properties Found
          </h2>
          <p className="text-gray-600">
            Page {page} of {totalPages}
          </p>
        </div>
        
        {/* Sort options */}
        <SortDropdown />
      </div>

      {/* Properties grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {properties.map((property) => (
          <PropertyCard key={property.id} property={property} />
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-8">
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            baseUrl="/properties"
            queryParams={searchParams}
          />
        </div>
      )}
    </div>
  );
}
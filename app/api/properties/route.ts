import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

import { propertyQuerySchema } from '@/lib/validations';
import { authOptions } from '@/lib/auth';
import cuid from 'cuid';

// GET /api/properties - Get all properties with filters
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const params = Object.fromEntries(searchParams.entries());
    
    // Parse and validate query parameters
    const query = propertyQuerySchema.safeParse(params);
    if (!query.success) {
      return NextResponse.json(
        { 
          error: 'Invalid query parameters', 
          details: query.error.issues 
        },
        { status: 400 }
      );
    }

    const queryData = query.data;
    const skip = (queryData.page - 1) * queryData.limit;

    // Build where clause
    const where: any = {
      isActive: true,
      status: { not: 'DRAFT' },
    };

    if (queryData.type) where.type = queryData.type;
    if (queryData.category) where.category = queryData.category;
    if (queryData.purpose) where.purpose = queryData.purpose;
    if (queryData.city) where.city = { contains: queryData.city, mode: 'insensitive' };
    if (queryData.state) where.state = { contains: queryData.state, mode: 'insensitive' };
    if (queryData.country) where.country = { contains: queryData.country, mode: 'insensitive' };
    if (queryData.status) where.status = queryData.status;
    if (queryData.userId) where.userId = queryData.userId;
    if (queryData.agentId) where.agentId = queryData.agentId;
    if (queryData.developerId) where.developerId = queryData.developerId;
    if (queryData.featured !== undefined) where.featured = queryData.featured;
    if (queryData.verified !== undefined) where.verified = queryData.verified;

    // Price filters
    if (queryData.category === 'SALE') {
      if (queryData.minPrice !== undefined) where.price = { gte: queryData.minPrice };
      if (queryData.maxPrice !== undefined) where.price = { ...where.price, lte: queryData.maxPrice };
    } else if (queryData.category === 'RENT') {
      if (queryData.minRent !== undefined) where.rentPrice = { gte: queryData.minRent };
      if (queryData.maxRent !== undefined) where.rentPrice = { ...where.rentPrice, lte: queryData.maxRent };
    } else {
      // For mixed category queries
      const priceFilters: any = {};
      if (queryData.minPrice !== undefined) priceFilters.price = { gte: queryData.minPrice };
      if (queryData.maxPrice !== undefined) priceFilters.price = { ...priceFilters.price, lte: queryData.maxPrice };
      if (queryData.minRent !== undefined) priceFilters.rentPrice = { gte: queryData.minRent };
      if (queryData.maxRent !== undefined) priceFilters.rentPrice = { ...priceFilters.rentPrice, lte: queryData.maxRent };
      
      if (Object.keys(priceFilters).length > 0) {
        where.OR = [
          { price: priceFilters.price },
          { rentPrice: priceFilters.rentPrice },
        ];
      }
    }

    // Other filters
    if (queryData.bedrooms !== undefined) where.bedrooms = { gte: queryData.bedrooms };
    if (queryData.bathrooms !== undefined) where.bathrooms = { gte: queryData.bathrooms };
    if (queryData.minArea !== undefined) where.area = { gte: queryData.minArea };
    if (queryData.maxArea !== undefined) where.area = { ...where.area, lte: queryData.maxArea };
    if (queryData.furnished !== undefined) where.furnished = queryData.furnished;
    if (queryData.petFriendly !== undefined) where.petFriendly = queryData.petFriendly;

    // Search
    if (queryData.search) {
      where.OR = [
        { title: { contains: queryData.search, mode: 'insensitive' } },
        { description: { contains: queryData.search, mode: 'insensitive' } },
        { address: { contains: queryData.search, mode: 'insensitive' } },
        { city: { contains: queryData.search, mode: 'insensitive' } },
        { state: { contains: queryData.search, mode: 'insensitive' } },
      ];
    }

    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;

    // Base include object
    const include: any = {
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
          favorites: true,
          bookings: true,
        },
      },
      reviews: {
        where: { status: 'APPROVED' },
        select: {
          rating: true,
        },
      },
    };

    // Conditionally include favorites if user is logged in
    if (userId) {
      include.favorites = {
        where: {
          userId,
        },
      };
    }

    // Execute queries
    const [properties, total] = await Promise.all([
      prisma.property.findMany({
        where,
        include,
        orderBy: {
          [queryData.sortBy]: queryData.sortOrder,
        },
        skip,
        take: queryData.limit,
      }),
      prisma.property.count({ where }),
    ]);

    // Process properties to include average rating, total reviews, and favorite status
    const propertiesWithStats = properties.map((property: any) => {
      const { _count, favorites, ...remainingProperty } = property;
      const reviews = (property.reviews || []) as Array<{ rating: number }>;
      const totalReviews = reviews.length;
      let sumRatings = 0;
      if (totalReviews > 0) {
        for (const review of reviews) {
          sumRatings += review.rating;
        }
      }
      const averageRating = totalReviews > 0 ? sumRatings / totalReviews : null;

      return {
        ...remainingProperty,
        averageRating,
        totalReviews,
        totalFavorites: _count.favorites,
        totalBookings: _count.bookings,
        isFavorited: !!favorites?.length,
      };
    });

    const totalPages = Math.ceil(total / queryData.limit);

    return NextResponse.json({
      success: true,
      data: propertiesWithStats,
      pagination: {
        page: queryData.page,
        limit: queryData.limit,
        total,
        totalPages,
        hasNextPage: queryData.page < totalPages,
        hasPrevPage: queryData.page > 1,
      },
    });

  } catch (error) {
    console.error('Error fetching properties:', error);
    return NextResponse.json(
      { error: 'Failed to fetch properties' },
      { status: 500 }
    );
  }
}

// POST /api/properties - Create a new property
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Generate a slug from the title
    const slug = body.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
    
    // Get user from session (you need to implement this)
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized - Please log in to create a property' },
        { status: 401 }
      );
    }
    
    // Handle amenities array
    const amenities = body.amenities ? 
      (Array.isArray(body.amenities) ? body.amenities : [body.amenities])
        .filter((a: string) => a.trim() !== '')
        .join(',') : null;
    
    // Handle images array
    const images = body.images ? 
      (Array.isArray(body.images) ? body.images : [body.images])
        .filter((img: string) => img.trim() !== '')
        .join(',') : null;
    
    // Create the property with all fields
    const property = await prisma.property.create({
      data: {
        title: body.title,
        description: body.description,
        type: body.type,
        category: body.category,
        purpose: body.purpose,
        slug: slug,
        
        // Pricing
        price: body.price || null,
        rentPrice: body.rentPrice || null,
        bookingPrice: body.bookingPrice || null,
        securityDeposit: body.securityDeposit || null,
        currency: body.currency || 'USD',
        pricePerSqft: body.pricePerSqft || null,
        maintenanceFee: body.maintenanceFee || null,
        
        // Location
        address: body.address,
        city: body.city,
        state: body.state,
        country: body.country,
        zipCode: body.zipCode || null,
        latitude: body.latitude ? parseFloat(body.latitude) : null,
        longitude: body.longitude ? parseFloat(body.longitude) : null,
        neighborhood: body.neighborhood || null,
        landmark: body.landmark || null,
        
        // Details
        bedrooms: body.bedrooms ? parseInt(body.bedrooms) : null,
        bathrooms: body.bathrooms ? parseFloat(body.bathrooms) : null,
        area: parseFloat(body.area) || 0,
        areaUnit: body.areaUnit || 'SQFT',
        yearBuilt: body.yearBuilt ? parseInt(body.yearBuilt) : null,
        parkingSpaces: body.parkingSpaces ? parseInt(body.parkingSpaces) : null,
        floors: body.floors ? parseInt(body.floors) : null,
        floorNumber: body.floorNumber ? parseInt(body.floorNumber) : null,
        furnished: body.furnished || false,
        petFriendly: body.petFriendly || false,
        amenities: amenities,
        utilitiesIncluded: body.utilitiesIncluded || false,
        
        // Booking
        minStay: body.minStay ? parseInt(body.minStay) : null,
        maxStay: body.maxStay ? parseInt(body.maxStay) : null,
        availableFrom: body.availableFrom || null,
        instantBook: body.instantBook || false,
        checkInTime: body.checkInTime || '14:00',
        checkOutTime: body.checkOutTime || '11:00',
        cancellationPolicy: body.cancellationPolicy || 'STRICT',
        
        // Media
        images: images,
        videos: body.videos || null,
        virtualTour: body.virtualTour || null,
        floorPlan: body.floorPlan || null,
        
        // Status
        status: body.status || 'DRAFT',
        featured: body.featured || false,
        verified: false, // Default to not verified
        
        // Relations
        userId: userId,
        agentId: body.agentId || null,
        developerId: body.developerId || null,
      },
    });
    
    return NextResponse.json(
      { 
        success: true, 
        message: 'Property created successfully!',
        data: property 
      }, 
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating property:', error);
    return NextResponse.json(
      { 
        error: 'Failed to create property', 
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
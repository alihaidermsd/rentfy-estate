import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

import { propertyQuerySchema, propertyCreateSchema } from '@/lib/validations';
import { authOptions } from '@/lib/auth';
import slugify from 'slugify';

// Helper function to generate slug
const generateSlug = (title: string): string => {
  return slugify(title, {
    lower: true,
    strict: true,
    trim: true,
  }) + '-' + Date.now();
};

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
      status: 'PUBLISHED',
    };

    // Basic filters
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

    // Price filters for SALE properties
    if (queryData.category === 'SALE') {
      if (queryData.minPrice !== undefined) where.price = { gte: queryData.minPrice };
      if (queryData.maxPrice !== undefined) where.price = { ...where.price, lte: queryData.maxPrice };
    } 
    // Price filters for RENT properties
    else if (queryData.category === 'RENT') {
      if (queryData.minRent !== undefined) where.rentPrice = { gte: queryData.minRent };
      if (queryData.maxRent !== undefined) where.rentPrice = { ...where.rentPrice, lte: queryData.maxRent };
    } 
    // Mixed category or no category specified
    else {
      const orConditions = [];
      
      if (queryData.minPrice !== undefined || queryData.maxPrice !== undefined) {
        const saleCondition: any = { category: 'SALE' };
        if (queryData.minPrice !== undefined) saleCondition.price = { gte: queryData.minPrice };
        if (queryData.maxPrice !== undefined) saleCondition.price = { ...saleCondition.price, lte: queryData.maxPrice };
        orConditions.push(saleCondition);
      }
      
      if (queryData.minRent !== undefined || queryData.maxRent !== undefined) {
        const rentCondition: any = { category: 'RENT' };
        if (queryData.minRent !== undefined) rentCondition.rentPrice = { gte: queryData.minRent };
        if (queryData.maxRent !== undefined) rentCondition.rentPrice = { ...rentCondition.rentPrice, lte: queryData.maxRent };
        orConditions.push(rentCondition);
      }
      
      if (orConditions.length > 0) {
        if (orConditions.length === 1) {
          Object.assign(where, orConditions[0]);
        } else {
          where.OR = orConditions;
        }
      }
    }

    // Property details filters
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
        { neighborhood: { contains: queryData.search, mode: 'insensitive' } },
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
          reviews: true,
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
        select: {
          id: true,
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
      const { _count, favorites, reviews, ...remainingProperty } = property;
      
      // Calculate average rating
      const totalReviews = reviews.length;
      const averageRating = totalReviews > 0 
        ? reviews.reduce((sum: number, review: any) => sum + review.rating, 0) / totalReviews 
        : null;

      // Parse string fields to arrays
      const parsedProperty = {
        ...remainingProperty,
        amenities: property.amenities ? property.amenities.split(',').filter(Boolean) : [],
        tags: property.tags ? property.tags.split(',').filter(Boolean) : [],
        images: property.images ? property.images.split(',').filter(Boolean) : [],
        videos: property.videos ? property.videos.split(',').filter(Boolean) : [],
        averageRating,
        totalReviews,
        totalFavorites: _count.favorites,
        totalBookings: _count.bookings,
        isFavorited: !!favorites?.length,
      };

      return parsedProperty;
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
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized - Please log in to create a property' },
        { status: 401 }
      );
    }

    const body = await request.json();
    
    // Validate request body
    const validation = propertyCreateSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { 
          error: 'Invalid property data', 
          details: validation.error.issues 
        },
        { status: 400 }
      );
    }

    const data = validation.data;
    
    // Generate slug from title
    const slug = generateSlug(data.title);
    
    // Prepare data for database
    const dbData: any = {
      title: data.title,
      description: data.description,
      type: data.type,
      category: data.category,
      purpose: data.purpose,
      slug,
      userId,
      
      // Pricing
      price: data.price,
      rentPrice: data.rentPrice,
      bookingPrice: data.bookingPrice,
      securityDeposit: data.securityDeposit,
      currency: data.currency,
      pricePerSqft: data.pricePerSqft,
      maintenanceFee: data.maintenanceFee,
      
      // Location
      address: data.address,
      city: data.city,
      state: data.state,
      country: data.country,
      zipCode: data.zipCode,
      latitude: data.latitude,
      longitude: data.longitude,
      neighborhood: data.neighborhood,
      landmark: data.landmark,
      
      // Details
      bedrooms: data.bedrooms,
      bathrooms: data.bathrooms,
      area: data.area,
      areaUnit: data.areaUnit,
      yearBuilt: data.yearBuilt,
      parkingSpaces: data.parkingSpaces,
      floors: data.floors,
      floorNumber: data.floorNumber,
      furnished: data.furnished,
      petFriendly: data.petFriendly,
      utilitiesIncluded: data.utilitiesIncluded,
      
      // Booking
      minStay: data.minStay,
      maxStay: data.maxStay,
      availableFrom: data.availableFrom ? new Date(data.availableFrom) : null,
      instantBook: data.instantBook,
      checkInTime: data.checkInTime,
      checkOutTime: data.checkOutTime,
      cancellationPolicy: data.cancellationPolicy,
      
      // Media - Convert arrays to comma-separated strings
      images: data.images.join(','),
      videos: data.videos?.join(',') || null,
      virtualTour: data.virtualTour,
      floorPlan: data.floorPlan,
      
      // Status
      status: data.status,
      featured: data.featured,
      verified: data.verified,
      isActive: true,
      
      // Relations
      agentId: data.agentId,
      developerId: data.developerId,
    };

    // Handle amenities if provided
    if (data.amenities && data.amenities.length > 0) {
      dbData.amenities = data.amenities.join(',');
    }

    // Create the property
    const property = await prisma.property.create({
      data: dbData,
    });

    // If agent is assigned, update their listing count
    if (data.agentId) {
      await prisma.agent.update({
        where: { id: data.agentId },
        data: { totalListings: { increment: 1 } },
      });
    }

    // If developer is assigned, update their listing count
    if (data.developerId) {
      await prisma.developer.update({
        where: { id: data.developerId },
        data: { totalListings: { increment: 1 } },
      });
    }

    return NextResponse.json(
      { 
        success: true, 
        message: 'Property created successfully!',
        data: property 
      }, 
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error creating property:', error);
    
    // Handle unique constraint errors
    if (error.code === 'P2002') {
      return NextResponse.json(
        { 
          error: 'Property with this title already exists',
          details: 'Please choose a different title'
        },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { 
        error: 'Failed to create property', 
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
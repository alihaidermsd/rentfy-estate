import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

import { authOptions } from '@/lib/auth';
import { propertyCreateSchema, propertyQuerySchema } from '@/lib/validations';

const prisma = new PrismaClient();

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
      const { _count, favorites, ...remaningProperty } = property;
      const reviews = (property.reviews || []) as Array<{ rating: number }>;
      const totalReviews = reviews.length; // Use length of the included reviews
      let sumRatings = 0;
      if (totalReviews > 0) {
        for (const review of reviews) {
          sumRatings += review.rating;
        }
      }
      const averageRating = totalReviews > 0 ? sumRatings / totalReviews : null;

      return {
        ...remaningProperty,
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
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    
    // Validate request body
    const validation = propertyCreateSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { 
          error: 'Validation failed', 
          details: validation.error.issues
        },
        { status: 400 }
      );
    }

    const data = validation.data;
    
    // Check if user is allowed to create properties
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { agentProfile: true, developerProfile: true },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Role-based permissions
    const allowedRoles = ['SUPER_ADMIN', 'ADMIN', 'OWNER', 'AGENT', 'DEVELOPER'];
    if (!allowedRoles.includes(user.role)) {
      return NextResponse.json(
        { error: 'Insufficient permissions to create properties' },
        { status: 403 }
      );
    }

    // Check if agent/developer IDs match the user
    if (data.agentId && user.agentProfile?.id !== data.agentId && user.role !== 'SUPER_ADMIN' && user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Agent ID does not match your profile' },
        { status: 403 }
      );
    }

    if (data.developerId && user.developerProfile?.id !== data.developerId && user.role !== 'SUPER_ADMIN' && user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Developer ID does not match your profile' },
        { status: 403 }
      );
    }

    // Generate slug from title
    const slug = data.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
      + '-' + Date.now().toString(36);

    // Prepare property data
    const propertyData: any = {
      title: data.title,
      description: data.description,
      type: data.type,
      category: data.category,
      purpose: data.purpose,
      slug,
      userId: session.user.id,
      
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
      amenities: data.amenities ? data.amenities.join(',') : null,
      utilitiesIncluded: data.utilitiesIncluded || false,
      
      // Status
      status: data.status,
      featured: data.featured || false,
      verified: data.verified || false,
      isActive: data.isActive !== undefined ? data.isActive : true,
      featuredUntil: data.featuredUntil ? new Date(data.featuredUntil) : null,
      
      // Relations
      agentId: data.agentId,
      developerId: data.developerId,
      
      // Metadata
      tags: data.tags ? data.tags.join(',') : null,
      seoTitle: data.seoTitle,
      seoDescription: data.seoDescription,
      keywords: data.keywords ? data.keywords.join(',') : null,
    };

    // Add booking-specific fields only for rental properties
    if (data.category === 'RENT') {
      propertyData.minStay = data.minStay || 1;
      propertyData.maxStay = data.maxStay;
      propertyData.availableFrom = data.availableFrom ? new Date(data.availableFrom) : null;
      propertyData.instantBook = data.instantBook || false;
      propertyData.checkInTime = data.checkInTime || '14:00';
      propertyData.checkOutTime = data.checkOutTime || '11:00';
      propertyData.cancellationPolicy = data.cancellationPolicy || 'STRICT';
    }

    // Add media fields
    propertyData.images = data.images ? data.images.join(',') : null;
    propertyData.videos = data.videos ? data.videos.join(',') : null;
    propertyData.virtualTour = data.virtualTour;
    propertyData.floorPlan = data.floorPlan;
    propertyData.documents = data.documents;

    // Create property
    const property = await prisma.property.create({
      data: propertyData,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        agent: {
          select: {
            id: true,
            user: { select: { name: true } },
            company: true,
          },
        },
      },
    });

    // Log the action
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: 'CREATE',
        entityType: 'PROPERTY',
        entityId: property.id,
        newData: JSON.stringify(property),
        ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown',
      },
    });

    // Update user/agent/developer stats if needed
    if (user.agentProfile) {
      await prisma.agent.update({
        where: { id: user.agentProfile.id },
        data: {
          totalListings: { increment: 1 },
        },
      });
    }

    if (user.developerProfile) {
      await prisma.developer.update({
        where: { id: user.developerProfile.id },
        data: {
          totalListings: { increment: 1 },
        },
      });
    }

    return NextResponse.json({
      success: true,
      data: property,
      message: 'Property created successfully',
    });

  } catch (error) {
    console.error('Error creating property:', error);
    return NextResponse.json(
      { error: 'Failed to create property' },
      { status: 500 }
    );
  }
}
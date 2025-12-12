import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { authOptions } from '@/lib/auth';

// Validation schema for updates
const propertyUpdateSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().min(1).optional(),
  type: z.enum(['APARTMENT', 'HOUSE', 'VILLA', 'CONDO', 'TOWNHOUSE', 'OFFICE', 'RETAIL', 'INDUSTRIAL', 'LAND', 'OTHER']).optional(),
  category: z.enum(['RENT', 'SALE']).optional(),
  purpose: z.enum(['RESIDENTIAL', 'COMMERCIAL', 'INDUSTRIAL', 'AGRICULTURAL']).optional(),
  price: z.number().min(0).optional().nullable(),
  rentPrice: z.number().min(0).optional().nullable(),
  bookingPrice: z.number().min(0).optional().nullable(),
  securityDeposit: z.number().min(0).optional().nullable(),
  currency: z.string().optional(),
  pricePerSqft: z.number().min(0).optional().nullable(),
  maintenanceFee: z.number().min(0).optional().nullable(),
  address: z.string().min(1).optional(),
  city: z.string().min(1).optional(),
  state: z.string().min(1).optional(),
  country: z.string().min(1).optional(),
  zipCode: z.string().optional().nullable(),
  latitude: z.number().optional().nullable(),
  longitude: z.number().optional().nullable(),
  neighborhood: z.string().optional().nullable(),
  landmark: z.string().optional().nullable(),
  bedrooms: z.number().int().min(0).optional().nullable(),
  bathrooms: z.number().int().min(0).optional().nullable(),
  area: z.number().min(1).optional(),
  areaUnit: z.enum(['SQFT', 'SQM', 'ACRES']).optional(),
  yearBuilt: z.number().int().optional().nullable(),
  parkingSpaces: z.number().int().min(0).optional().nullable(),
  floors: z.number().int().min(1).optional().nullable(),
  floorNumber: z.number().int().min(0).optional().nullable(),
  furnished: z.boolean().optional().nullable(),
  petFriendly: z.boolean().optional().nullable(),
  amenities: z.array(z.string()).optional(),
  utilitiesIncluded: z.boolean().optional(),
  minStay: z.number().int().min(1).optional().nullable(),
  maxStay: z.number().int().min(1).optional().nullable(),
  availableFrom: z.string().optional().nullable(),
  instantBook: z.boolean().optional(),
  checkInTime: z.string().optional().nullable(),
  checkOutTime: z.string().optional().nullable(),
  cancellationPolicy: z.enum(['FLEXIBLE', 'MODERATE', 'STRICT', 'SUPER_STRICT']).optional().nullable(),
  images: z.array(z.string()).optional(),
  videos: z.array(z.string()).optional().nullable(),
  virtualTour: z.string().optional().nullable(),
  floorPlan: z.string().optional().nullable(),
  documents: z.string().optional().nullable(),
  status: z.enum(['DRAFT', 'PUBLISHED', 'UNAVAILABLE', 'SOLD', 'RENTED']).optional(),
  featured: z.boolean().optional(),
  verified: z.boolean().optional(),
  isActive: z.boolean().optional(),
  featuredUntil: z.string().optional().nullable(),
  agentId: z.string().optional().nullable(),
  developerId: z.string().optional().nullable(),
  tags: z.array(z.string()).optional(),
  seoTitle: z.string().optional().nullable(),
  seoDescription: z.string().optional().nullable(),
  keywords: z.array(z.string()).optional().nullable(),
});

// Helper function to get client IP
const getClientIp = (request: NextRequest): string => {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    const ips = forwarded.split(',').map(ip => ip.trim());
    return ips[0] || 'unknown';
  }
  return 'unknown';
};

// GET /api/properties/[id] - Get property by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // Increment view count
    await prisma.property.update({
      where: { id },
      data: { views: { increment: 1 } },
    });

    const property = await prisma.property.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
            phone: true,
          },
        },
        agent: {
          select: {
            id: true,
            user: {
              select: {
                name: true,
                image: true,
                email: true,
                phone: true,
              },
            },
            company: true,
            licenseNumber: true,
            experience: true,
            bio: true,
            specialties: true,
            languages: true,
            verified: true,
            featured: true,
            averageRating: true,
            reviewCount: true,
          },
        },
        developer: {
          select: {
            id: true,
            companyName: true,
            description: true,
            logo: true,
            website: true,
            phone: true,
            email: true,
            verified: true,
            featured: true,
            averageRating: true,
          },
        },
        reviews: {
          where: { status: 'APPROVED' },
          include: {
            user: {
              select: {
                name: true,
                image: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
        availabilities: {
          where: { date: { gte: new Date() } },
          orderBy: { date: 'asc' },
          take: 30,
        },
        _count: {
          select: {
            favorites: true,
            reviews: true,
            bookings: true,
          },
        },
      },
    });

    if (!property) {
      return NextResponse.json(
        { error: 'Property not found' },
        { status: 404 }
      );
    }

    // Calculate average rating
    const reviews = await prisma.review.findMany({
      where: { propertyId: id, status: 'APPROVED' },
      select: { rating: true },
    });

    const averageRating = reviews.length > 0
      ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
      : null;

    // Parse string fields to arrays
    const propertyWithParsedData = {
      ...property,
      amenities: property.amenities ? property.amenities.split(',').filter(Boolean) : [],
      tags: property.tags ? property.tags.split(',').filter(Boolean) : [],
      images: property.images ? property.images.split(',').filter(Boolean) : [],
      videos: property.videos ? property.videos.split(',').filter(Boolean) : [],
      averageRating,
      totalReviews: reviews.length,
    };

    return NextResponse.json({
      success: true,
      data: propertyWithParsedData,
    });

  } catch (error) {
    console.error('Error fetching property:', error);
    return NextResponse.json(
      { error: 'Failed to fetch property' },
      { status: 500 }
    );
  }
}

// PUT /api/properties/[id] - Update property
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = await params;
    const body = await request.json();

    // Validate request body
    const validation = propertyUpdateSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.issues },
        { status: 400 }
      );
    }

    const data = validation.data;

    // Check if property exists and user has permission
    const property = await prisma.property.findUnique({
      where: { id },
      include: {
        user: true,
        agent: true,
        developer: true,
      },
    });

    if (!property) {
      return NextResponse.json(
        { error: 'Property not found' },
        { status: 404 }
      );
    }

    // Check permissions
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        agentProfile: true,
        developerProfile: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const isOwner = property.userId === session.user.id;
    const isAgent = property.agentId && user.agentProfile?.id === property.agentId;
    const isDeveloper = property.developerId && user.developerProfile?.id === property.developerId;
    const isAdmin = ['SUPER_ADMIN', 'ADMIN'].includes(user.role);

    if (!isOwner && !isAgent && !isDeveloper && !isAdmin) {
      return NextResponse.json(
        { error: 'Insufficient permissions to update this property' },
        { status: 403 }
      );
    }

    // Check agent/developer ID permissions
    if (data.agentId && data.agentId !== property.agentId) {
      if (user.role !== 'SUPER_ADMIN' && user.role !== 'ADMIN') {
        if (user.agentProfile?.id !== data.agentId) {
          return NextResponse.json(
            { error: 'Cannot assign property to another agent' },
            { status: 403 }
          );
        }
      }
    }

    if (data.developerId && data.developerId !== property.developerId) {
      if (user.role !== 'SUPER_ADMIN' && user.role !== 'ADMIN') {
        if (user.developerProfile?.id !== data.developerId) {
          return NextResponse.json(
            { error: 'Cannot assign property to another developer' },
            { status: 403 }
          );
        }
      }
    }

    // Prepare update data
    const updateData: any = {};

    // Copy validated data
    Object.keys(data).forEach((key) => {
      const value = data[key as keyof typeof data];
      if (value !== undefined) {
        updateData[key] = value;
      }
    });

    // Handle array fields - convert to comma-separated strings
    if (data.amenities && Array.isArray(data.amenities)) {
      updateData.amenities = data.amenities.join(',');
    }
    if (data.tags && Array.isArray(data.tags)) {
      updateData.tags = data.tags.join(',');
    }
    if (data.images && Array.isArray(data.images)) {
      updateData.images = data.images.join(',');
    }
    if (data.videos && Array.isArray(data.videos)) {
      updateData.videos = data.videos.join(',');
    }
    if (data.keywords && Array.isArray(data.keywords)) {
      updateData.keywords = data.keywords.join(',');
    }

    // Handle date fields
    if (data.availableFrom) {
      updateData.availableFrom = new Date(data.availableFrom);
    }
    if (data.featuredUntil) {
      updateData.featuredUntil = new Date(data.featuredUntil);
    }

    // Get old data for audit log
    const oldData = { ...property };

    // Update property
    const updatedProperty = await prisma.property.update({
      where: { id },
      data: updateData,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    // Get client IP and user agent
    const clientIp = getClientIp(request);
    const userAgent = request.headers.get('user-agent') || 'unknown';

    // Log the action
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: 'UPDATE',
        entityType: 'PROPERTY',
        entityId: id,
        oldData: JSON.stringify(oldData),
        newData: JSON.stringify(updatedProperty),
        ipAddress: clientIp,
        userAgent: userAgent,
      },
    });

    return NextResponse.json({
      success: true,
      data: updatedProperty,
      message: 'Property updated successfully',
    });

  } catch (error) {
    console.error('Error updating property:', error);
    return NextResponse.json(
      { error: 'Failed to update property' },
      { status: 500 }
    );
  }
}

// DELETE /api/properties/[id] - Delete property
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = await params;

    // Check if property exists and user has permission
    const property = await prisma.property.findUnique({
      where: { id },
      include: {
        user: true,
        agent: true,
        developer: true,
      },
    });

    if (!property) {
      return NextResponse.json(
        { error: 'Property not found' },
        { status: 404 }
      );
    }

    // Check permissions
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        agentProfile: true,
        developerProfile: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const isOwner = property.userId === session.user.id;
    const isAgent = property.agentId && user.agentProfile?.id === property.agentId;
    const isDeveloper = property.developerId && user.developerProfile?.id === property.developerId;
    const isAdmin = ['SUPER_ADMIN', 'ADMIN'].includes(user.role);

    if (!isOwner && !isAgent && !isDeveloper && !isAdmin) {
      return NextResponse.json(
        { error: 'Insufficient permissions to delete this property' },
        { status: 403 }
      );
    }

    // Check if property has active bookings
    const activeBookings = await prisma.booking.count({
      where: {
        propertyId: id,
        status: { in: ['PENDING', 'CONFIRMED', 'CHECKED_IN'] },
      },
    });

    if (activeBookings > 0) {
      return NextResponse.json(
        { error: 'Cannot delete property with active bookings' },
        { status: 400 }
      );
    }

    // Get old data for audit log
    const oldData = { ...property };

    // Soft delete by setting isActive to false
    const deletedProperty = await prisma.property.update({
      where: { id },
      data: { isActive: false, status: 'UNAVAILABLE' },
    });

    // Get client IP and user agent
    const clientIp = getClientIp(request);
    const userAgent = request.headers.get('user-agent') || 'unknown';

    // Log the action
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: 'DELETE',
        entityType: 'PROPERTY',
        entityId: id,
        oldData: JSON.stringify(oldData),
        ipAddress: clientIp,
        userAgent: userAgent,
      },
    });

    // Update user/agent/developer stats
    if (property.agentId) {
      await prisma.agent.update({
        where: { id: property.agentId },
        data: {
          totalListings: { decrement: 1 },
        },
      });
    }

    if (property.developerId) {
      await prisma.developer.update({
        where: { id: property.developerId },
        data: {
          totalListings: { decrement: 1 },
        },
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Property deleted successfully',
    });

  } catch (error) {
    console.error('Error deleting property:', error);
    return NextResponse.json(
      { error: 'Failed to delete property' },
      { status: 500 }
    );
  }
}
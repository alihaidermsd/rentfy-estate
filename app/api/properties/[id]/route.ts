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
    const { id } = params;
    const body = await request.json();

    // Development: accept any fields and update property directly
    const updateData: any = { ...body };

    // Convert arrays to comma strings when necessary
    if (Array.isArray(updateData.images)) updateData.images = updateData.images.join(',');
    if (Array.isArray(updateData.tags)) updateData.tags = updateData.tags.join(',');
    if (Array.isArray(updateData.amenities)) updateData.amenities = updateData.amenities.join(',');
    if (Array.isArray(updateData.videos)) updateData.videos = updateData.videos.join(',');

    if (updateData.availableFrom) updateData.availableFrom = new Date(updateData.availableFrom);
    if (updateData.featuredUntil) updateData.featuredUntil = new Date(updateData.featuredUntil);

    const existing = await prisma.property.findUnique({ where: { id } });
    if (!existing) return NextResponse.json({ error: 'Property not found' }, { status: 404 });

    const updated = await prisma.property.update({ where: { id }, data: updateData });
    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error('Error updating property (dev relax):', error);
    return NextResponse.json({ error: 'Failed to update property' }, { status: 500 });
  }
}

// DELETE /api/properties/[id] - Delete property
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const existing = await prisma.property.findUnique({ where: { id } });
    if (!existing) return NextResponse.json({ error: 'Property not found' }, { status: 404 });

    // Soft delete without checks
    const deleted = await prisma.property.update({ where: { id }, data: { isActive: false, status: 'UNAVAILABLE' } });
    return NextResponse.json({ success: true, data: deleted, message: 'Property deleted (dev)' });
  } catch (error) {
    console.error('Error deleting property (dev relax):', error);
    return NextResponse.json({ error: 'Failed to delete property' }, { status: 500 });
  }
}
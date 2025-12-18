import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { propertyUpdateSchema } from '@/lib/validations';
import { authOptions } from '@/lib/auth';

// Helper function to check user permissions
async function checkPropertyPermission(userId: string, propertyId: string): Promise<boolean> {
  const property = await prisma.property.findUnique({
    where: { id: propertyId },
    select: { userId: true, agentId: true, developerId: true },
  });

  if (!property) return false;

  // Check if user is owner, assigned agent, or assigned developer
  return property.userId === userId || 
         property.agentId === userId || 
         property.developerId === userId;
}

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

    // Check if user has favorited this property
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;
    
    let isFavorited = false;
    if (userId) {
      const favorite = await prisma.favorite.findFirst({
        where: {
          userId,
          propertyId: id,
        },
      });
      isFavorited = !!favorite;
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
      isFavorited,
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
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if property exists and user has permission
    const existingProperty = await prisma.property.findUnique({
      where: { id },
    });

    if (!existingProperty) {
      return NextResponse.json(
        { error: 'Property not found' },
        { status: 404 }
      );
    }

    // Check permissions
    const hasPermission = await checkPropertyPermission(userId, id);
    if (!hasPermission && session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'You do not have permission to update this property' },
        { status: 403 }
      );
    }

    const body = await request.json();
    
    // Validate update data
    const validation = propertyUpdateSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { 
          error: 'Invalid update data', 
          details: validation.error.issues 
        },
        { status: 400 }
      );
    }

    const updateData = validation.data;
    const dbUpdateData: any = {};

    // Type-safe way to handle updateData fields
    if (updateData.title !== undefined) dbUpdateData.title = updateData.title;
    if (updateData.description !== undefined) dbUpdateData.description = updateData.description;
    if (updateData.type !== undefined) dbUpdateData.type = updateData.type;
    if (updateData.category !== undefined) dbUpdateData.category = updateData.category;
    if (updateData.purpose !== undefined) dbUpdateData.purpose = updateData.purpose;
    
    // Pricing fields
    if (updateData.price !== undefined) dbUpdateData.price = updateData.price;
    if (updateData.rentPrice !== undefined) dbUpdateData.rentPrice = updateData.rentPrice;
    if (updateData.bookingPrice !== undefined) dbUpdateData.bookingPrice = updateData.bookingPrice;
    if (updateData.securityDeposit !== undefined) dbUpdateData.securityDeposit = updateData.securityDeposit;
    if (updateData.currency !== undefined) dbUpdateData.currency = updateData.currency;
    if (updateData.pricePerSqft !== undefined) dbUpdateData.pricePerSqft = updateData.pricePerSqft;
    if (updateData.maintenanceFee !== undefined) dbUpdateData.maintenanceFee = updateData.maintenanceFee;
    
    // Location fields
    if (updateData.address !== undefined) dbUpdateData.address = updateData.address;
    if (updateData.city !== undefined) dbUpdateData.city = updateData.city;
    if (updateData.state !== undefined) dbUpdateData.state = updateData.state;
    if (updateData.country !== undefined) dbUpdateData.country = updateData.country;
    if (updateData.zipCode !== undefined) dbUpdateData.zipCode = updateData.zipCode;
    if (updateData.latitude !== undefined) dbUpdateData.latitude = updateData.latitude;
    if (updateData.longitude !== undefined) dbUpdateData.longitude = updateData.longitude;
    if (updateData.neighborhood !== undefined) dbUpdateData.neighborhood = updateData.neighborhood;
    if (updateData.landmark !== undefined) dbUpdateData.landmark = updateData.landmark;
    
    // Details fields
    if (updateData.bedrooms !== undefined) dbUpdateData.bedrooms = updateData.bedrooms;
    if (updateData.bathrooms !== undefined) dbUpdateData.bathrooms = updateData.bathrooms;
    if (updateData.area !== undefined) dbUpdateData.area = updateData.area;
    if (updateData.areaUnit !== undefined) dbUpdateData.areaUnit = updateData.areaUnit;
    if (updateData.yearBuilt !== undefined) dbUpdateData.yearBuilt = updateData.yearBuilt;
    if (updateData.parkingSpaces !== undefined) dbUpdateData.parkingSpaces = updateData.parkingSpaces;
    if (updateData.floors !== undefined) dbUpdateData.floors = updateData.floors;
    if (updateData.floorNumber !== undefined) dbUpdateData.floorNumber = updateData.floorNumber;
    if (updateData.furnished !== undefined) dbUpdateData.furnished = updateData.furnished;
    if (updateData.petFriendly !== undefined) dbUpdateData.petFriendly = updateData.petFriendly;
    if (updateData.utilitiesIncluded !== undefined) dbUpdateData.utilitiesIncluded = updateData.utilitiesIncluded;
    
    // Booking fields
    if (updateData.minStay !== undefined) dbUpdateData.minStay = updateData.minStay;
    if (updateData.maxStay !== undefined) dbUpdateData.maxStay = updateData.maxStay;
    if (updateData.instantBook !== undefined) dbUpdateData.instantBook = updateData.instantBook;
    if (updateData.checkInTime !== undefined) dbUpdateData.checkInTime = updateData.checkInTime;
    if (updateData.checkOutTime !== undefined) dbUpdateData.checkOutTime = updateData.checkOutTime;
    if (updateData.cancellationPolicy !== undefined) dbUpdateData.cancellationPolicy = updateData.cancellationPolicy;
    
    // Media fields (convert arrays to strings)
    if (updateData.images !== undefined) dbUpdateData.images = updateData.images.join(',');
    if (updateData.videos !== undefined) dbUpdateData.videos = updateData.videos ? updateData.videos.join(',') : null;
    if (updateData.virtualTour !== undefined) dbUpdateData.virtualTour = updateData.virtualTour;
    if (updateData.floorPlan !== undefined) dbUpdateData.floorPlan = updateData.floorPlan;
    if (updateData.documents !== undefined) dbUpdateData.documents = updateData.documents;
    
    // Status fields
    if (updateData.status !== undefined) dbUpdateData.status = updateData.status;
    if (updateData.featured !== undefined) dbUpdateData.featured = updateData.featured;
    if (updateData.verified !== undefined) dbUpdateData.verified = updateData.verified;
    if (updateData.isActive !== undefined) dbUpdateData.isActive = updateData.isActive;
    
    // Relation fields
    if (updateData.agentId !== undefined) dbUpdateData.agentId = updateData.agentId;
    if (updateData.developerId !== undefined) dbUpdateData.developerId = updateData.developerId;
    
    // SEO fields (convert arrays to strings)
    if (updateData.seoTitle !== undefined) dbUpdateData.seoTitle = updateData.seoTitle;
    if (updateData.seoDescription !== undefined) dbUpdateData.seoDescription = updateData.seoDescription;
    if (updateData.keywords !== undefined) dbUpdateData.keywords = updateData.keywords ? updateData.keywords.join(',') : null;
    
    // Special handling for arrays that need to be converted
    if (updateData.amenities !== undefined) dbUpdateData.amenities = updateData.amenities.join(',');
    if (updateData.tags !== undefined) dbUpdateData.tags = updateData.tags.join(',');
    
    // Date fields
    if (updateData.availableFrom !== undefined) {
      dbUpdateData.availableFrom = updateData.availableFrom ? new Date(updateData.availableFrom) : null;
    }
    if (updateData.featuredUntil !== undefined) {
      dbUpdateData.featuredUntil = updateData.featuredUntil ? new Date(updateData.featuredUntil) : null;
    }

    // If status is being changed to PUBLISHED, set publishedAt
    if (updateData.status === 'PUBLISHED' && existingProperty.status !== 'PUBLISHED') {
      dbUpdateData.publishedAt = new Date();
    }

    const updatedProperty = await prisma.property.update({
      where: { id },
      data: dbUpdateData,
    });

    return NextResponse.json({
      success: true,
      message: 'Property updated successfully',
      data: updatedProperty,
    });

  } catch (error: any) {
    console.error('Error updating property:', error);
    
    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Property not found' },
        { status: 404 }
      );
    }
    
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
    const { id } = params;
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if property exists
    const existingProperty = await prisma.property.findUnique({
      where: { id },
    });

    if (!existingProperty) {
      return NextResponse.json(
        { error: 'Property not found' },
        { status: 404 }
      );
    }

    // Check permissions (only owner or admin can delete)
    if (existingProperty.userId !== userId && session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'You do not have permission to delete this property' },
        { status: 403 }
      );
    }

    // Soft delete the property
    const deletedProperty = await prisma.property.update({
      where: { id },
      data: {
        isActive: false,
        status: 'UNAVAILABLE',
      },
    });

    // If agent was assigned, update their listing count
    if (existingProperty.agentId) {
      await prisma.agent.update({
        where: { id: existingProperty.agentId },
        data: { totalListings: { decrement: 1 } },
      });
    }

    // If developer was assigned, update their listing count
    if (existingProperty.developerId) {
      await prisma.developer.update({
        where: { id: existingProperty.developerId },
        data: { totalListings: { decrement: 1 } },
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Property deleted successfully',
      data: deletedProperty,
    });

  } catch (error) {
    console.error('Error deleting property:', error);
    return NextResponse.json(
      { error: 'Failed to delete property' },
      { status: 500 }
    );
  }
}
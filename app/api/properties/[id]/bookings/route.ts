import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { authOptions } from '@/lib/auth';

// Validation schemas
const bookingsQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  status: z.enum(['PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED', 'CHECKED_IN', 'CHECKED_OUT']).optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  userId: z.string().optional(),
  sortBy: z.enum(['createdAt', 'startDate', 'endDate', 'totalAmount']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

// Helper function to check permissions
async function checkBookingPermissions(userId: string, propertyId: string): Promise<boolean> {
  const property = await prisma.property.findUnique({
    where: { id: propertyId },
    select: { userId: true, agentId: true, developerId: true },
  });

  if (!property) return false;

  return (
    property.userId === userId ||
    property.agentId === userId ||
    property.developerId === userId
  );
}

// GET /api/properties/[id]/bookings - Get property bookings
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;

    // Check if property exists
    const propertyExists = await prisma.property.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!propertyExists) {
      return NextResponse.json(
        { error: 'Property not found' },
        { status: 404 }
      );
    }

    const { searchParams } = new URL(request.url);
    const paramsObj = Object.fromEntries(searchParams.entries());
    
    // Validate query parameters
    const query = bookingsQuerySchema.safeParse(paramsObj);
    if (!query.success) {
      return NextResponse.json(
        { 
          error: 'Invalid query parameters', 
          details: query.error.issues 
        },
        { status: 400 }
      );
    }

    const { 
      page, 
      limit, 
      status, 
      startDate, 
      endDate, 
      userId: queryUserId,
      sortBy, 
      sortOrder 
    } = query.data;

    const skip = (page - 1) * limit;
    
    // Build where clause
    const where: any = { propertyId: id };
    
    if (status) where.status = status;
    
    // Date range filtering
    if (startDate || endDate) {
      where.AND = [];
      
      if (startDate) {
        where.AND.push({
          OR: [
            { startDate: { gte: new Date(startDate) } },
            { endDate: { gte: new Date(startDate) } },
          ],
        });
      }
      
      if (endDate) {
        where.AND.push({
          OR: [
            { startDate: { lte: new Date(endDate) } },
            { endDate: { lte: new Date(endDate) } },
          ],
        });
      }
    }
    
    // User filtering (only if admin or property owner)
    if (queryUserId) {
      if (userId) {
        const hasPermission = await checkBookingPermissions(userId, id);
        if (hasPermission || session.user.role === 'ADMIN') {
          where.userId = queryUserId;
        }
      }
    } else if (userId) {
      // If no user filter and user is logged in but not admin/owner,
      // only show their own bookings
      const hasPermission = await checkBookingPermissions(userId, id);
      if (!hasPermission && session.user.role !== 'ADMIN') {
        where.userId = userId;
      }
    }

    // Execute queries
    const [bookings, total] = await Promise.all([
      prisma.booking.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
              image: true,
            },
          },
          property: {
            select: {
              title: true,
              images: true,
              address: true,
              city: true,
              state: true,
            },
          },
          payments: {
            select: {
              status: true,
              amount: true,
              currency: true,
              paymentMethod: true,
            },
            orderBy: { createdAt: 'desc' },
            take: 1,
          },
          review: {
            select: {
              id: true,
              rating: true,
              comment: true,
            },
          },
        },
        orderBy: {
          [sortBy]: sortOrder,
        },
        skip,
        take: limit,
      }),
      prisma.booking.count({ where }),
    ]);

    // Parse images and add additional data
    const bookingsWithDetails = bookings.map(booking => {
      const images = booking.property.images 
        ? booking.property.images.split(',').filter(Boolean)
        : [];
      
      const latestPayment = booking.payments[0];
      
      return {
        ...booking,
        property: {
          ...booking.property,
          images,
        },
        latestPayment,
        hasReview: !!booking.review,
        review: booking.review || null,
        // Calculate booking status with color coding
        statusInfo: {
          label: booking.status,
          color: getStatusColor(booking.status),
          isActive: ['PENDING', 'CONFIRMED', 'CHECKED_IN'].includes(booking.status),
          isCompleted: ['COMPLETED', 'CHECKED_OUT'].includes(booking.status),
          isCancelled: booking.status === 'CANCELLED',
        },
      };
    });

    const totalPages = Math.ceil(total / limit);

    // Get booking statistics
    const stats = await prisma.booking.groupBy({
      by: ['status'],
      where: { propertyId: id },
      _count: true,
      _sum: {
        totalAmount: true,
      },
    });

    // Calculate revenue
    const totalRevenue = stats
      .filter(stat => stat.status === 'COMPLETED' || stat.status === 'CHECKED_OUT')
      .reduce((sum, stat) => sum + (stat._sum.totalAmount || 0), 0);

    return NextResponse.json({
      success: true,
      data: bookingsWithDetails,
      statistics: {
        totalBookings: total,
        byStatus: stats.reduce((acc, stat) => {
          acc[stat.status] = stat._count;
          return acc;
        }, {} as Record<string, number>),
        totalRevenue,
        averageBookingValue: total > 0 ? totalRevenue / total : 0,
      },
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    });

  } catch (error) {
    console.error('Property bookings fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch property bookings' },
      { status: 500 }
    );
  }
}

// POST /api/properties/[id]/bookings - Create booking for property
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized - Please log in to book' },
        { status: 401 }
      );
    }

    const body = await request.json();
    
    // Validate booking data
    const bookingSchema = z.object({
      startDate: z.string().datetime(),
      endDate: z.string().datetime(),
      guests: z.number().int().min(1),
      guestName: z.string().min(1),
      guestEmail: z.string().email(),
      guestPhone: z.string().optional(),
      guestAddress: z.string().optional(),
      specialRequests: z.string().optional(),
      paymentMethod: z.enum(['CREDIT_CARD', 'BANK_TRANSFER', 'CASH', 'OTHER']).optional(),
    });

    const validation = bookingSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { 
          error: 'Invalid booking data', 
          details: validation.error.issues 
        },
        { status: 400 }
      );
    }

    const bookingData = validation.data;
    const startDate = new Date(bookingData.startDate);
    const endDate = new Date(bookingData.endDate);

    // Validate dates
    if (startDate >= endDate) {
      return NextResponse.json(
        { error: 'End date must be after start date' },
        { status: 400 }
      );
    }

    // Check property availability and details
    const property = await prisma.property.findUnique({
      where: { id },
      select: {
        id: true,
        isActive: true,
        status: true,
        category: true,
        rentPrice: true,
        bookingPrice: true,
        securityDeposit: true,
        minStay: true,
        maxStay: true,
        availableFrom: true,
        instantBook: true,
        userId: true,
        currency: true,
      },
    });

    if (!property || !property.isActive) {
      return NextResponse.json(
        { error: 'Property not found or inactive' },
        { status: 404 }
      );
    }

    if (property.status !== 'PUBLISHED') {
      return NextResponse.json(
        { error: 'Property is not available for booking' },
        { status: 400 }
      );
    }

    // Check if user is trying to book their own property
    if (property.userId === userId) {
      return NextResponse.json(
        { error: 'Cannot book your own property' },
        { status: 400 }
      );
    }

    // Check date range availability
    const availabilityCheck = await fetch(
      `${request.nextUrl.origin}/api/properties/${id}/availability?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}&includeBookings=true`
    );
    
    if (!availabilityCheck.ok) {
      const errorData = await availabilityCheck.json();
      return NextResponse.json(
        { error: errorData.error || 'Availability check failed' },
        { status: 400 }
      );
    }

    const availabilityData = await availabilityCheck.json();
    
    if (!availabilityData.data.isAvailable) {
      return NextResponse.json(
        { 
          error: 'Property is not available for the selected dates',
          details: availabilityData.data.reasons || [],
        },
        { status: 400 }
      );
    }

    // Calculate total days and amount
    const timeDiff = endDate.getTime() - startDate.getTime();
    const totalDays = Math.ceil(timeDiff / (1000 * 3600 * 24));
    
    // Check min/max stay
    if (property.minStay && totalDays < property.minStay) {
      return NextResponse.json(
        { error: `Minimum stay is ${property.minStay} days` },
        { status: 400 }
      );
    }

    if (property.maxStay && totalDays > property.maxStay) {
      return NextResponse.json(
        { error: `Maximum stay is ${property.maxStay} days` },
        { status: 400 }
      );
    }

    // Calculate total amount
    let totalAmount = 0;
    if (property.category === 'RENT' && property.rentPrice) {
      totalAmount = property.rentPrice * totalDays;
    } else if (property.bookingPrice) {
      totalAmount = property.bookingPrice;
    }

    // Add security deposit if applicable
    if (property.securityDeposit) {
      totalAmount += property.securityDeposit;
    }

    // Generate booking number
    const bookingNumber = `BK-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;

    // Create booking
    const booking = await prisma.booking.create({
      data: {
        propertyId: id,
        userId,
        bookingNumber,
        startDate,
        endDate,
        totalDays,
        totalAmount,
        currency: property.currency || 'USD',
        guests: bookingData.guests,
        guestName: bookingData.guestName,
        guestEmail: bookingData.guestEmail,
        guestPhone: bookingData.guestPhone,
        guestAddress: bookingData.guestAddress,
        specialRequests: bookingData.specialRequests,
        status: property.instantBook ? 'CONFIRMED' : 'PENDING',
        paymentMethod: bookingData.paymentMethod,
      },
      include: {
        property: {
          select: {
            title: true,
            images: true,
            address: true,
          },
        },
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    // Update property availability for booked dates
    const dateArray: Date[] = [];
    const currentDate = new Date(startDate);
    while (currentDate <= endDate) {
      dateArray.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }

    // Create or update availability entries
    await Promise.all(
      dateArray.map(date => 
        prisma.availability.upsert({
          where: {
            propertyId_date: {
              propertyId: id,
              date,
            },
          },
          update: {
            available: false,
            blockedBy: booking.id,
          },
          create: {
            propertyId: id,
            date,
            available: false,
            blockedBy: booking.id,
          },
        })
      )
    );

    return NextResponse.json({
      success: true,
      message: property.instantBook 
        ? 'Booking confirmed successfully!' 
        : 'Booking request submitted. Waiting for confirmation.',
      data: {
        ...booking,
        property: {
          ...booking.property,
          images: booking.property.images 
            ? booking.property.images.split(',').filter(Boolean)
            : [],
        },
        requiresConfirmation: !property.instantBook,
        nextSteps: property.instantBook 
          ? ['Make payment to complete booking']
          : ['Wait for host confirmation', 'Make payment after confirmation'],
      },
    }, { status: 201 });

  } catch (error) {
    console.error('Booking creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create booking' },
      { status: 500 }
    );
  }
}

// Helper function for status colors
function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    PENDING: 'warning',
    CONFIRMED: 'success',
    CANCELLED: 'error',
    COMPLETED: 'info',
    CHECKED_IN: 'success',
    CHECKED_OUT: 'info',
  };
  return colors[status] || 'default';
}
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { authOptions } from '@/lib/auth';

// Validation schemas
const bookingsQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  status: z.enum(['PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED', 'CHECKED_IN', 'CHECKED_OUT']).optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  propertyId: z.string().optional(),
  userId: z.string().optional(),
  search: z.string().optional(),
  sortBy: z.enum(['createdAt', 'startDate', 'endDate', 'totalAmount']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
  includeUser: z.coerce.boolean().default(false), // Changed from string enum to boolean
  includeProperty: z.coerce.boolean().default(true), // Changed from string enum to boolean
});

// Type definitions
interface BookingWithRelations {
  id: string;
  propertyId: string;
  userId: string;
  bookingNumber: string;
  startDate: Date;
  endDate: Date;
  totalDays: number;
  totalAmount: number;
  currency: string;
  guests: number;
  guestName: string;
  guestEmail: string;
  guestPhone: string | null;
  guestAddress: string | null;
  specialRequests: string | null;
  status: string;
  paymentStatus: string;
  cancellationReason: string | null;
  paymentMethod: string | null;
  paymentId: string | null;
  checkInTime: string | null;
  checkOutTime: string | null;
  confirmedAt: Date | null;
  cancelledAt: Date | null;
  checkInAt: Date | null;
  checkOutAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  property?: {
    id: string;
    title: string;
    images: string | null;
    address: string;
    city: string;
    state: string;
    user: {
      name: string | null;
      email: string;
      phone: string | null;
    };
  };
  user?: {
    id: string;
    name: string | null;
    email: string;
    phone: string | null;
  };
  payments: Array<{
    id: string;
    bookingId: string;
    paymentNumber: string;
    amount: number;
    currency: string;
    status: string;
    paymentMethod: string;
    gateway: string;
    gatewayPaymentId: string | null;
    gatewayTransactionId: string | null;
    refundId: string | null;
    lastFourDigits: string | null;
    cardBrand: string | null;
    cardExpiry: string | null;
    createdAt: Date;
    updatedAt: Date;
    processedAt: Date | null;
    refundedAt: Date | null;
  }>;
}

// GET /api/bookings - Get all bookings (with filters)
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;

    if (!userId || !session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
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
      propertyId,
      userId: queryUserId,
      search,
      sortBy, 
      sortOrder,
      includeUser,
      includeProperty,
    } = query.data;

    const skip = (page - 1) * limit;
    
    // Build where clause with proper typing
    const where: any = {};

    // Role-based filtering
    if (session.user.role === 'ADMIN') {
      // Admin can see all bookings
      if (queryUserId) where.userId = queryUserId;
      if (propertyId) where.propertyId = propertyId;
    } else if (session.user.role === 'AGENT') {
      // Agent can see bookings for their properties
      const agentProperties = await prisma.property.findMany({
        where: { agentId: userId },
        select: { id: true },
      });
      
      where.propertyId = {
        in: agentProperties.map(p => p.id),
      };
      
      if (queryUserId) where.userId = queryUserId;
    } else {
      // Regular users can only see their own bookings
      where.userId = userId;
      if (propertyId) where.propertyId = propertyId;
    }
    
    // Additional filters
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
    
    // Search functionality
    if (search) {
      where.OR = [
        { bookingNumber: { contains: search, mode: 'insensitive' } },
        { guestName: { contains: search, mode: 'insensitive' } },
        { guestEmail: { contains: search, mode: 'insensitive' } },
        {
          property: {
            title: { contains: search, mode: 'insensitive' },
          },
        },
      ];
    }

    // Build include object with explicit types
    const include: any = {
      payments: {
        select: {
          id: true,
          bookingId: true,
          paymentNumber: true,
          amount: true,
          currency: true,
          status: true,
          paymentMethod: true,
          gateway: true,
          gatewayPaymentId: true,
          gatewayTransactionId: true,
          refundId: true,
          lastFourDigits: true,
          cardBrand: true,
          cardExpiry: true,
          createdAt: true,
          updatedAt: true,
          processedAt: true,
          refundedAt: true,
        },
        orderBy: { createdAt: 'desc' },
        take: 1,
      },
    };
    
    if (includeProperty) {
      include.property = {
        select: {
          id: true,
          title: true,
          images: true,
          address: true,
          city: true,
          state: true,
          user: {
            select: {
              name: true,
              email: true,
              phone: true,
            },
          },
          agent: {
            select: {
              user: {
                select: {
                  name: true,
                  email: true,
                  phone: true,
                },
              },
            },
          },
          developer: {
            select: {
              user: {
                select: {
                  name: true,
                  email: true,
                  phone: true,
                },
              },
            },
          },
        },
      };
    }
    
    if (includeUser && session.user.role === 'ADMIN') {
      include.user = {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
        },
      };
    }

    // Execute queries with proper error handling
    const [bookings, total] = await Promise.all([
      prisma.booking.findMany({
        where,
        include,
        orderBy: {
          [sortBy]: sortOrder,
        },
        skip,
        take: limit,
      }),
      prisma.booking.count({ where }),
    ]);

    // Process bookings with proper typing
    const processedBookings = bookings.map((booking: any) => {
      const bookingData: any = {
        id: booking.id,
        propertyId: booking.propertyId,
        userId: booking.userId,
        bookingNumber: booking.bookingNumber,
        startDate: booking.startDate,
        endDate: booking.endDate,
        totalDays: booking.totalDays,
        totalAmount: booking.totalAmount,
        currency: booking.currency,
        guests: booking.guests,
        guestName: booking.guestName,
        guestEmail: booking.guestEmail,
        guestPhone: booking.guestPhone,
        guestAddress: booking.guestAddress,
        specialRequests: booking.specialRequests,
        status: booking.status,
        paymentStatus: booking.paymentStatus,
        cancellationReason: booking.cancellationReason,
        paymentMethod: booking.paymentMethod,
        checkInTime: booking.checkInTime,
        checkOutTime: booking.checkOutTime,
        confirmedAt: booking.confirmedAt,
        cancelledAt: booking.cancelledAt,
        checkInAt: booking.checkInAt,
        checkOutAt: booking.checkOutAt,
        createdAt: booking.createdAt,
        updatedAt: booking.updatedAt,
        latestPayment: booking.payments[0] || null,
        statusInfo: getBookingStatusInfo(booking.status),
      };

      // Add user data if included
      if (booking.user) {
        bookingData.user = booking.user;
      }

      // Parse property images if included and property exists
      if (booking.property && includeProperty) {
        bookingData.property = {
          id: booking.property.id,
          title: booking.property.title,
          address: booking.property.address,
          city: booking.property.city,
          state: booking.property.state,
          host: booking.property.user,
          images: booking.property.images 
            ? booking.property.images.split(',').filter(Boolean) 
            : [],
        };
      }

      return bookingData;
    });

    const totalPages = Math.ceil(total / limit);

    // Get booking statistics
    let stats: any = {};
    if (session.user.role === 'ADMIN') {
      stats = await getAdminBookingStats();
    } else if (session.user.role === 'AGENT') {
      stats = await getAgentBookingStats(userId);
    } else {
      stats = await getUserBookingStats(userId);
    }

    return NextResponse.json({
      success: true,
      data: processedBookings,
      statistics: stats,
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
    console.error('Bookings fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch bookings' },
      { status: 500 }
    );
  }
}

// POST /api/bookings - Create a new booking (alternative to property-specific booking)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    
    // Validate booking data
    const bookingSchema = z.object({
      propertyId: z.string(),
      startDate: z.string().datetime(),
      endDate: z.string().datetime(),
      guests: z.number().int().min(1).default(1),
      guestName: z.string().min(1),
      guestEmail: z.string().email(),
      guestPhone: z.string().optional(),
      guestAddress: z.string().optional(),
      specialRequests: z.string().optional(),
      paymentMethod: z.enum(['CREDIT_CARD', 'BANK_TRANSFER', 'CASH', 'OTHER']).optional(),
      paymentIntentId: z.string().optional(), // For Stripe or other payment gateways
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

    // Check property availability using the property's availability API
    const availabilityCheck = await fetch(
      `${request.nextUrl.origin}/api/properties/${bookingData.propertyId}/availability?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}&includeBookings=true`
    );
    
    if (!availabilityCheck.ok) {
      const errorData = await availabilityCheck.json().catch(() => ({}));
      return NextResponse.json(
        { error: errorData.error || 'Availability check failed' },
        { status: 400 }
      );
    }

    const availabilityData = await availabilityCheck.json();
    
    if (!availabilityData.data?.isAvailable) {
      return NextResponse.json(
        { 
          error: 'Property is not available for the selected dates',
          details: availabilityData.data?.reasons || [],
        },
        { status: 400 }
      );
    }

    // Get property details
    const property = await prisma.property.findUnique({
      where: { id: bookingData.propertyId },
      select: {
        id: true,
        title: true,
        category: true,
        rentPrice: true,
        bookingPrice: true,
        securityDeposit: true,
        minStay: true,
        maxStay: true,
        instantBook: true,
        userId: true,
        currency: true,
        user: {
          select: {
            name: true,
            email: true,
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

    // Calculate total days and amount
    const timeDiff = endDate.getTime() - startDate.getTime();
    const totalDays = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
    
    let totalAmount = 0;
    if (property.category === 'RENT' && property.rentPrice) {
      totalAmount = property.rentPrice * totalDays;
    } else if (property.bookingPrice) {
      totalAmount = property.bookingPrice;
    }

    // Add security deposit
    if (property.securityDeposit) {
      totalAmount += property.securityDeposit;
    }

    // Generate booking number
    const bookingNumber = `BK-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;

    // Create booking
    const booking = await prisma.booking.create({
      data: {
        propertyId: bookingData.propertyId,
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
        guestPhone: bookingData.guestPhone || null,
        guestAddress: bookingData.guestAddress || null,
        specialRequests: bookingData.specialRequests || null,
        status: property.instantBook ? 'CONFIRMED' : 'PENDING',
        paymentMethod: bookingData.paymentMethod || null,
        paymentId: bookingData.paymentIntentId || null,
      },
      include: {
        property: {
          select: {
            title: true,
            address: true,
            city: true,
            user: {
              select: {
                name: true,
                email: true,
                phone: true,
              },
            },
          },
        },
      },
    });

    // Create initial payment record if payment intent provided
    if (bookingData.paymentIntentId) {
      await prisma.payment.create({
        data: {
          bookingId: booking.id,
          paymentNumber: `PAY-${Date.now()}`,
          amount: totalAmount,
          currency: property.currency || 'USD',
          status: 'SUCCEEDED',
          paymentMethod: bookingData.paymentMethod || 'CREDIT_CARD',
          gateway: 'STRIPE',
          gatewayPaymentId: bookingData.paymentIntentId,
          processedAt: new Date(),
        },
      });
      
      // Update booking payment status
      await prisma.booking.update({
        where: { id: booking.id },
        data: { paymentStatus: 'SUCCEEDED' },
      });
    }

    return NextResponse.json({
      success: true,
      message: property.instantBook 
        ? 'Booking confirmed successfully!' 
        : 'Booking request submitted. Waiting for confirmation.',
      data: {
        ...booking,
        requiresConfirmation: !property.instantBook,
        hostContact: property.user,
        nextSteps: property.instantBook 
          ? ['Check your email for booking details']
          : ['Wait for host confirmation', 'Complete payment after confirmation'],
      },
    }, { status: 201 });

  } catch (error: any) {
    console.error('Booking creation error:', error);
    
    if (error.code === 'P2003') {
      return NextResponse.json(
        { error: 'Property not found' },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to create booking' },
      { status: 500 }
    );
  }
}

// Helper functions
async function getAdminBookingStats() {
  const [totalBookings, totalRevenue, statusStats, monthlyStats] = await Promise.all([
    prisma.booking.count(),
    prisma.booking.aggregate({
      where: {
        status: { in: ['COMPLETED', 'CHECKED_OUT'] },
      },
      _sum: {
        totalAmount: true,
      },
    }),
    prisma.booking.groupBy({
      by: ['status'],
      _count: true,
    }),
    prisma.$queryRaw`
      SELECT 
        strftime('%Y-%m-01', "createdAt") as month,
        COUNT(*) as count,
        COALESCE(SUM("totalAmount"), 0) as revenue
      FROM "Booking"
      WHERE "createdAt" >= DATETIME(julianday('now', '-6 months'))
        AND status IN ('COMPLETED', 'CHECKED_OUT')
      GROUP BY strftime('%Y-%m-01', "createdAt")
      ORDER BY month ASC
    `,
  ]);

  return {
    totalBookings,
    totalRevenue: totalRevenue._sum.totalAmount || 0,
    byStatus: statusStats.reduce((acc: Record<string, number>, stat) => {
      acc[stat.status] = stat._count;
      return acc;
    }, {}),
    monthlyStats: Array.isArray(monthlyStats) ? monthlyStats.map((stat: any) => ({
      month: stat.month.toISOString().slice(0, 7),
      count: Number(stat.count),
      revenue: Number(stat.revenue),
    })) : [],
  };
}

async function getAgentBookingStats(agentId: string) {
  const agentProperties = await prisma.property.findMany({
    where: { agentId },
    select: { id: true },
  });
  
  const propertyIds = agentProperties.map(p => p.id);
  
  const [totalBookings, totalRevenue, statusStats] = await Promise.all([
    prisma.booking.count({
      where: { propertyId: { in: propertyIds } },
    }),
    prisma.booking.aggregate({
      where: {
        propertyId: { in: propertyIds },
        status: { in: ['COMPLETED', 'CHECKED_OUT'] },
      },
      _sum: {
        totalAmount: true,
      },
    }),
    prisma.booking.groupBy({
      by: ['status'],
      where: { propertyId: { in: propertyIds } },
      _count: true,
    }),
  ]);

  return {
    totalBookings,
    totalRevenue: totalRevenue._sum.totalAmount || 0,
    byStatus: statusStats.reduce((acc: Record<string, number>, stat) => {
      acc[stat.status] = stat._count;
      return acc;
    }, {}),
  };
}

async function getUserBookingStats(userId: string) {
  const [totalBookings, upcomingBookings, pastBookings] = await Promise.all([
    prisma.booking.count({ where: { userId } }),
    prisma.booking.count({
      where: {
        userId,
        startDate: { gte: new Date() },
        status: { in: ['CONFIRMED', 'PENDING'] },
      },
    }),
    prisma.booking.count({
      where: {
        userId,
        endDate: { lt: new Date() },
        status: { in: ['COMPLETED', 'CHECKED_OUT'] },
      },
    }),
  ]);

  return {
    totalBookings,
    upcomingBookings,
    pastBookings,
  };
}

function getBookingStatusInfo(status: string) {
  const statusMap: Record<string, any> = {
    PENDING: {
      label: 'Pending',
      color: 'warning',
      description: 'Waiting for host confirmation',
      icon: '⏳',
    },
    CONFIRMED: {
      label: 'Confirmed',
      color: 'success',
      description: 'Booking confirmed',
      icon: '✅',
    },
    CANCELLED: {
      label: 'Cancelled',
      color: 'error',
      description: 'Booking cancelled',
      icon: '❌',
    },
    COMPLETED: {
      label: 'Completed',
      color: 'info',
      description: 'Booking completed',
      icon: '🏁',
    },
    CHECKED_IN: {
      label: 'Checked In',
      color: 'success',
      description: 'Guest has checked in',
      icon: '🏠',
    },
    CHECKED_OUT: {
      label: 'Checked Out',
      color: 'info',
      description: 'Guest has checked out',
      icon: '🚪',
    },
  };

  return statusMap[status] || {
    label: status,
    color: 'default',
    description: 'Unknown status',
    icon: '❓',
  };
}
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { authOptions } from '@/lib/auth';

// Validation schemas
const availabilityQuerySchema = z.object({
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
  includeBookings: z.enum(['true', 'false']).optional().default('false'),
});

const availabilityUpdateSchema = z.object({
  date: z.string().datetime(),
  available: z.boolean().optional().default(true),
  price: z.number().positive().optional().nullable(),
  blockedBy: z.string().optional().nullable(),
});

const bulkAvailabilitySchema = z.object({
  dates: z.array(z.string().datetime()).min(1),
  available: z.boolean().optional().default(true),
  price: z.number().positive().optional().nullable(),
});

const dateRangeSchema = z.object({
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
  available: z.boolean().optional().default(true),
  price: z.number().positive().optional().nullable(),
  daysOfWeek: z.array(z.number().min(0).max(6)).optional(), // 0=Sunday, 6=Saturday
});

// Helper function to check property existence and permissions
async function checkPropertyAccess(propertyId: string, userId: string): Promise<boolean> {
  const property = await prisma.property.findUnique({
    where: { id: propertyId },
    select: { userId: true, agentId: true, developerId: true },
  });

  if (!property) return false;

  // Property owner, assigned agent/developer, or admin can manage availability
  return (
    property.userId === userId ||
    property.agentId === userId ||
    property.developerId === userId
  );
}

// GET /api/properties/[id]/availability - Check property availability
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    
    // Check if property exists
    const property = await prisma.property.findUnique({
      where: { id },
      select: { id: true, isActive: true, status: true },
    });

    if (!property) {
      return NextResponse.json(
        { error: 'Property not found' },
        { status: 404 }
      );
    }

    if (!property.isActive || property.status !== 'PUBLISHED') {
      return NextResponse.json(
        { 
          error: 'Property is not available',
          details: 'This property is currently not available for booking'
        },
        { status: 400 }
      );
    }

    const { searchParams } = new URL(request.url);
    const paramsObj = Object.fromEntries(searchParams.entries());
    
    // Validate query parameters
    const query = availabilityQuerySchema.safeParse(paramsObj);
    if (!query.success) {
      return NextResponse.json(
        { 
          error: 'Invalid query parameters', 
          details: query.error.issues 
        },
        { status: 400 }
      );
    }

    const { startDate, endDate, includeBookings } = query.data;
    const start = new Date(startDate);
    const end = new Date(endDate);

    // Validate date range
    if (start > end) {
      return NextResponse.json(
        { error: 'startDate must be before endDate' },
        { status: 400 }
      );
    }

    // Calculate number of days
    const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    if (days > 365) {
      return NextResponse.json(
        { error: 'Date range cannot exceed 365 days' },
        { status: 400 }
      );
    }

    // Check property settings for booking constraints
    const propertyDetails = await prisma.property.findUnique({
      where: { id },
      select: {
        minStay: true,
        maxStay: true,
        availableFrom: true,
        instantBook: true,
        category: true,
        status: true,
      },
    });

    if (!propertyDetails) {
      return NextResponse.json(
        { error: 'Property details not found' },
        { status: 404 }
      );
    }

    // Check if dates are within property constraints
    if (propertyDetails.availableFrom && start < propertyDetails.availableFrom) {
      return NextResponse.json(
        { 
          error: 'Invalid date range',
          details: `Property is only available from ${propertyDetails.availableFrom.toISOString().split('T')[0]}`
        },
        { status: 400 }
      );
    }

    // Check min/max stay constraints
    if (propertyDetails.minStay && days < propertyDetails.minStay) {
      return NextResponse.json(
        { 
          error: 'Minimum stay requirement',
          details: `Minimum stay is ${propertyDetails.minStay} days`
        },
        { status: 400 }
      );
    }

    if (propertyDetails.maxStay && days > propertyDetails.maxStay) {
      return NextResponse.json(
        { 
          error: 'Maximum stay exceeded',
          details: `Maximum stay is ${propertyDetails.maxStay} days`
        },
        { status: 400 }
      );
    }

    // Generate all dates in range
    const dateArray: Date[] = [];
    const currentDate = new Date(start);
    while (currentDate <= end) {
      dateArray.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }

    // Check availabilities for each date
    const availabilities = await prisma.availability.findMany({
      where: {
        propertyId: id,
        date: {
          gte: start,
          lte: end,
        },
      },
      orderBy: { date: 'asc' },
    });

    // Check for existing bookings in the date range
    const existingBookings = includeBookings === 'true' 
      ? await prisma.booking.findMany({
          where: {
            propertyId: id,
            OR: [
              {
                startDate: { lte: end },
                endDate: { gte: start },
              },
            ],
            status: { in: ['PENDING', 'CONFIRMED', 'CHECKED_IN'] },
          },
          select: {
            id: true,
            startDate: true,
            endDate: true,
            status: true,
            bookingNumber: true,
          },
        })
      : [];

    // Build availability map
    const availabilityMap = new Map();
    availabilities.forEach((avail) => {
      const dateStr = avail.date.toISOString().split('T')[0];
      availabilityMap.set(dateStr, {
        available: avail.available,
        price: avail.price,
        blockedBy: avail.blockedBy,
      });
    });

    // Check each date's availability
    const dateAvailability = dateArray.map((date) => {
      const dateStr = date.toISOString().split('T')[0];
      const availability = availabilityMap.get(dateStr);
      
      // If specific availability is set, use it
      if (availability) {
        return {
          date: dateStr,
          available: availability.available,
          price: availability.price,
          blockedBy: availability.blockedBy,
          reason: !availability.available ? 'Manually blocked' : null,
        };
      }
      
      // Default to available
      return {
        date: dateStr,
        available: true,
        price: null,
        blockedBy: null,
        reason: null,
      };
    });

    // Check if any dates are unavailable
    const isFullyAvailable = dateAvailability.every((date) => date.available);
    
    // Check if any bookings conflict
    const hasBookingConflict = existingBookings.some((booking) => {
      const bookingStart = booking.startDate;
      const bookingEnd = booking.endDate;
      return !(end < bookingStart || start > bookingEnd);
    });

    const overallAvailable = isFullyAvailable && !hasBookingConflict;

    // Calculate total price if property is for rent
    let totalPrice = null;
    if (propertyDetails.category === 'RENT' && propertyDetails) {
      const property = await prisma.property.findUnique({
        where: { id },
        select: { rentPrice: true },
      });
      
      if (property?.rentPrice) {
        // Use custom prices from availability if available
        const customPrices = dateAvailability
          .filter(date => date.price !== null)
          .map(date => date.price as number);
        
        if (customPrices.length > 0) {
          totalPrice = customPrices.reduce((sum, price) => sum + price, 0);
        } else {
          totalPrice = property.rentPrice * days;
        }
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        isAvailable: overallAvailable,
        propertyId: id,
        dateRange: {
          startDate: start.toISOString().split('T')[0],
          endDate: end.toISOString().split('T')[0],
          days,
        },
        propertyConstraints: {
          minStay: propertyDetails.minStay,
          maxStay: propertyDetails.maxStay,
          availableFrom: propertyDetails.availableFrom?.toISOString().split('T')[0],
          instantBook: propertyDetails.instantBook,
        },
        dates: dateAvailability,
        existingBookings: includeBookings === 'true' ? existingBookings : undefined,
        pricing: totalPrice ? {
          total: totalPrice,
          currency: 'USD',
          perDay: propertyDetails.category === 'RENT' ? totalPrice / days : null,
          hasCustomPrices: dateAvailability.some(date => date.price !== null),
        } : null,
        message: overallAvailable 
          ? 'Property is available for the selected dates' 
          : 'Property is not available for the selected dates',
        reasons: !overallAvailable ? [
          ...dateAvailability.filter(d => !d.available).map(d => `${d.date}: ${d.reason}`),
          hasBookingConflict ? 'Conflicting booking exists' : null,
        ].filter(Boolean) : [],
      },
    });

  } catch (error) {
    console.error('Availability check error:', error);
    return NextResponse.json(
      { error: 'Failed to check availability' },
      { status: 500 }
    );
  }
}

// POST /api/properties/[id]/availability - Update availability for a specific date
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
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if user has permission to update availability
    const hasPermission = await checkPropertyAccess(id, userId);
    if (!hasPermission && session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'You do not have permission to update availability for this property' },
        { status: 403 }
      );
    }

    const body = await request.json();
    
    // Check for bulk update
    if (body.dates || (body.startDate && body.endDate)) {
      return handleBulkAvailability(request, { params });
    }

    // Single date update
    const validation = availabilityUpdateSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { 
          error: 'Invalid request data', 
          details: validation.error.issues 
        },
        { status: 400 }
      );
    }

    const { date, available, price, blockedBy } = validation.data;
    const dateObj = new Date(date);

    // Check if date is in the past
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (dateObj < today) {
      return NextResponse.json(
        { error: 'Cannot update availability for past dates' },
        { status: 400 }
      );
    }

    // Check for existing bookings on this date
    const existingBooking = await prisma.booking.findFirst({
      where: {
        propertyId: id,
        startDate: { lte: dateObj },
        endDate: { gte: dateObj },
        status: { in: ['CONFIRMED', 'CHECKED_IN'] },
      },
    });

    if (existingBooking && !available) {
      return NextResponse.json(
        { 
          error: 'Cannot block date with existing booking',
          details: `Date is booked (Booking #${existingBooking.bookingNumber})`
        },
        { status: 400 }
      );
    }

    // Update or create availability
    const availability = await prisma.availability.upsert({
      where: {
        propertyId_date: {
          propertyId: id,
          date: dateObj,
        },
      },
      update: {
        available,
        price,
        blockedBy,
      },
      create: {
        propertyId: id,
        date: dateObj,
        available,
        price,
        blockedBy,
      },
    });

    return NextResponse.json({
      success: true,
      message: `Date ${dateObj.toISOString().split('T')[0]} marked as ${available ? 'available' : 'unavailable'}`,
      data: availability,
    });

  } catch (error: any) {
    console.error('Availability update error:', error);
    
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'Availability entry already exists for this date' },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to update availability' },
      { status: 500 }
    );
  }
}

// DELETE /api/properties/[id]/availability - Remove availability override
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

    // Check if user has permission
    const hasPermission = await checkPropertyAccess(id, userId);
    if (!hasPermission && session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'You do not have permission to modify availability for this property' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date');

    if (!date) {
      return NextResponse.json(
        { error: 'Date parameter is required' },
        { status: 400 }
      );
    }

    const dateObj = new Date(date);

    // Delete the availability entry
    await prisma.availability.delete({
      where: {
        propertyId_date: {
          propertyId: id,
          date: dateObj,
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: `Availability override removed for ${dateObj.toISOString().split('T')[0]}`,
    });

  } catch (error: any) {
    console.error('Availability delete error:', error);
    
    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Availability entry not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to remove availability' },
      { status: 500 }
    );
  }
}

// Helper function for bulk availability updates
async function handleBulkAvailability(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();
    
    // Check which bulk update method is being used
    if (body.dates) {
      // Bulk update for specific dates
      const validation = bulkAvailabilitySchema.safeParse(body);
      if (!validation.success) {
        return NextResponse.json(
          { 
            error: 'Invalid bulk update data', 
            details: validation.error.issues 
          },
          { status: 400 }
        );
      }

      const { dates, available, price } = validation.data;
      
      // Process each date
      const operations = dates.map((dateStr) => {
        const date = new Date(dateStr);
        return prisma.availability.upsert({
          where: {
            propertyId_date: {
              propertyId: id,
              date,
            },
          },
          update: {
            available,
            price,
          },
          create: {
            propertyId: id,
            date,
            available,
            price,
          },
        });
      });

      const results = await prisma.$transaction(operations);

      return NextResponse.json({
        success: true,
        message: `Updated ${results.length} dates`,
        data: {
          updatedCount: results.length,
          dates: dates,
        },
      });

    } else if (body.startDate && body.endDate) {
      // Update date range
      const validation = dateRangeSchema.safeParse(body);
      if (!validation.success) {
        return NextResponse.json(
          { 
            error: 'Invalid date range data', 
            details: validation.error.issues 
          },
          { status: 400 }
        );
      }

      const { startDate, endDate, available, price, daysOfWeek } = validation.data;
      const start = new Date(startDate);
      const end = new Date(endDate);

      // Generate all dates in range
      const dateArray: Date[] = [];
      const currentDate = new Date(start);
      while (currentDate <= end) {
        // Filter by days of week if specified
        if (!daysOfWeek || daysOfWeek.includes(currentDate.getDay())) {
          dateArray.push(new Date(currentDate));
        }
        currentDate.setDate(currentDate.getDate() + 1);
      }

      // Process each date
      const operations = dateArray.map((date) => {
        return prisma.availability.upsert({
          where: {
            propertyId_date: {
              propertyId: id,
              date,
            },
          },
          update: {
            available,
            price,
          },
          create: {
            propertyId: id,
            date,
            available,
            price,
          },
        });
      });

      const results = await prisma.$transaction(operations);

      return NextResponse.json({
        success: true,
        message: `Updated ${results.length} dates in the specified range`,
        data: {
          updatedCount: results.length,
          startDate: start.toISOString().split('T')[0],
          endDate: end.toISOString().split('T')[0],
          daysOfWeek,
        },
      });
    }

    return NextResponse.json(
      { error: 'Invalid bulk update format' },
      { status: 400 }
    );

  } catch (error) {
    console.error('Bulk availability update error:', error);
    return NextResponse.json(
      { error: 'Failed to perform bulk update' },
      { status: 500 }
    );
  }
}
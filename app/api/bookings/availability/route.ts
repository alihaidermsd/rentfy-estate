import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { authOptions } from '@/lib/auth';

// Validation schemas
const availabilityQuerySchema = z.object({
  propertyIds: z.string().optional(), // Comma-separated property IDs
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
  status: z.enum(['available', 'booked', 'blocked']).optional(),
  includeProperties: z.enum(['true', 'false']).optional().default('false'),
});

// GET /api/availability - Get availability across multiple properties
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
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

    const { 
      propertyIds, 
      startDate, 
      endDate, 
      status,
      includeProperties,
    } = query.data;

    const start = new Date(startDate);
    const end = new Date(endDate);

    // Validate date range
    if (start > end) {
      return NextResponse.json(
        { error: 'startDate must be before endDate' },
        { status: 400 }
      );
    }

    const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    if (days > 90) {
      return NextResponse.json(
        { error: 'Date range cannot exceed 90 days' },
        { status: 400 }
      );
    }

    // Determine which properties to query
    let whereProperties: any = { isActive: true, status: 'PUBLISHED' };
    
    if (propertyIds) {
      const ids = propertyIds.split(',').filter(Boolean);
      whereProperties.id = { in: ids };
    } else if (session.user.role === 'USER') {
      // Regular users can only see their own properties
      whereProperties.userId = userId;
    } else if (session.user.role === 'AGENT') {
      // Agents can see their assigned properties
      whereProperties.OR = [
        { userId: userId },
        { agentId: userId },
      ];
    }
    // Admin can see all properties

    // Get properties
    const properties = await prisma.property.findMany({
      where: whereProperties,
      select: {
        id: true,
        title: true,
        type: true,
        category: true,
        city: true,
        state: true,
        price: true,
        rentPrice: true,
        minStay: true,
        maxStay: true,
        availableFrom: true,
        ...(includeProperties === 'true' && {
          images: true,
          address: true,
          bedrooms: true,
          bathrooms: true,
          area: true,
          user: {
            select: {
              name: true,
              email: true,
            },
          },
        }),
      },
    });

    if (properties.length === 0) {
      return NextResponse.json({
        success: true,
        data: {
          properties: [],
          availability: [],
          message: 'No properties found',
        },
      });
    }

    const propertyIdsList = properties.map(p => p.id);

    // Get bookings in date range
    const bookings = await prisma.booking.findMany({
      where: {
        propertyId: { in: propertyIdsList },
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
        propertyId: true,
        startDate: true,
        endDate: true,
        status: true,
        bookingNumber: true,
        guestName: true,
      },
    });

    // Get manual availability blocks
    const availabilities = await prisma.availability.findMany({
      where: {
        propertyId: { in: propertyIdsList },
        date: {
          gte: start,
          lte: end,
        },
      },
      select: {
        propertyId: true,
        date: true,
        available: true,
        price: true,
        blockedBy: true,
      },
    });

    // Generate date range
    const dateArray: Date[] = [];
    const currentDate = new Date(start);
    while (currentDate <= end) {
      dateArray.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }

    // Process availability for each property
    const propertyAvailability = properties.map(property => {
      const propertyBookings = bookings.filter(b => b.propertyId === property.id);
      const propertyAvailabilities = availabilities.filter(a => a.propertyId === property.id);
      
      // Create availability map for this property
      const availabilityMap = new Map();
      dateArray.forEach(date => {
        const dateStr = date.toISOString().split('T')[0];
        
        // Check manual availability first
        const manualAvailability = propertyAvailabilities.find(a => 
          a.date.toISOString().split('T')[0] === dateStr
        );
        
        // Check bookings
        const hasBooking = propertyBookings.some(booking => {
          const bookingStart = booking.startDate.toISOString().split('T')[0];
          const bookingEnd = booking.endDate.toISOString().split('T')[0];
          return dateStr >= bookingStart && dateStr <= bookingEnd;
        });
        
        // Determine status
        let status: 'available' | 'booked' | 'blocked' = 'available';
        let reason = '';
        
        if (manualAvailability) {
          status = manualAvailability.available ? 'available' : 'blocked';
          reason = manualAvailability.blockedBy || 'Manually blocked';
        } else if (hasBooking) {
          status = 'booked';
          const booking = propertyBookings.find(b => 
            dateStr >= b.startDate.toISOString().split('T')[0] && 
            dateStr <= b.endDate.toISOString().split('T')[0]
          );
          reason = booking ? `Booked by ${booking.guestName}` : 'Booked';
        }
        
        availabilityMap.set(dateStr, {
          date: dateStr,
          status,
          reason,
          price: manualAvailability?.price || (property.category === 'RENT' ? property.rentPrice : property.price),
        });
      });

      // Filter by status if specified
      const filteredDates = Array.from(availabilityMap.values()).filter(date => 
        !status || date.status === status
      );

      // Calculate statistics
      const totalDates = dateArray.length;
      const availableDates = Array.from(availabilityMap.values()).filter(d => d.status === 'available').length;
      const bookedDates = Array.from(availabilityMap.values()).filter(d => d.status === 'booked').length;
      const blockedDates = Array.from(availabilityMap.values()).filter(d => d.status === 'blocked').length;

      return {
        property: {
          id: property.id,
          title: property.title,
          type: property.type,
          category: property.category,
          location: `${property.city}, ${property.state}`,
          price: property.price,
          rentPrice: property.rentPrice,
          ...(includeProperties === 'true' && {
            images: property.images ? property.images.split(',').filter(Boolean) : [],
            address: property.address,
            bedrooms: property.bedrooms,
            bathrooms: property.bathrooms,
            area: property.area,
            host: property.user,
          }),
        },
        availability: filteredDates,
        statistics: {
          totalDates,
          availableDates,
          bookedDates,
          blockedDates,
          availabilityPercentage: Math.round((availableDates / totalDates) * 100),
        },
        constraints: {
          minStay: property.minStay,
          maxStay: property.maxStay,
          availableFrom: property.availableFrom,
        },
      };
    });

    // Calculate overall statistics
    const overallStats = {
      totalProperties: properties.length,
      totalAvailableProperties: propertyAvailability.filter(p => 
        p.statistics.availableDates > 0
      ).length,
      averageAvailability: Math.round(
        propertyAvailability.reduce((sum, p) => sum + p.statistics.availabilityPercentage, 0) / 
        properties.length
      ),
    };

    return NextResponse.json({
      success: true,
      data: {
        dateRange: {
          startDate: start.toISOString().split('T')[0],
          endDate: end.toISOString().split('T')[0],
          days,
        },
        properties: propertyAvailability,
        overallStats,
        filters: {
          status,
          includeProperties,
        },
      },
    });

  } catch (error) {
    console.error('Global availability fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch availability' },
      { status: 500 }
    );
  }
}

// POST /api/availability - Bulk availability operations
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

    // Only admins and agents can perform bulk operations
    if (session.user.role !== 'ADMIN' && session.user.role !== 'AGENT') {
      return NextResponse.json(
        { error: 'Admin or agent access required' },
        { status: 403 }
      );
    }

    const body = await request.json();
    
    // Validate bulk operation
    const bulkSchema = z.object({
      operation: z.enum(['block', 'unblock', 'set_price']),
      propertyIds: z.array(z.string()).min(1),
      startDate: z.string().datetime(),
      endDate: z.string().datetime(),
      price: z.number().positive().optional(),
      reason: z.string().optional(),
      daysOfWeek: z.array(z.number().min(0).max(6)).optional(),
    });

    const validation = bulkSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { 
          error: 'Invalid bulk operation data', 
          details: validation.error.issues 
        },
        { status: 400 }
      );
    }

    const { operation, propertyIds, startDate, endDate, price, reason, daysOfWeek } = validation.data;
    const start = new Date(startDate);
    const end = new Date(endDate);

    // Generate dates for each property
    const operations: any[] = [];
    
    for (const propertyId of propertyIds) {
      // Check property access
      const property = await prisma.property.findUnique({
        where: { id: propertyId },
        select: { userId: true, agentId: true },
      });

      if (!property) continue;

      // Check permissions
      const hasAccess = 
        property.userId === userId || 
        property.agentId === userId || 
        session.user.role === 'ADMIN';

      if (!hasAccess) continue;

      // Generate dates for this property
      const dateArray: Date[] = [];
      const currentDate = new Date(start);
      while (currentDate <= end) {
        // Filter by days of week if specified
        if (!daysOfWeek || daysOfWeek.includes(currentDate.getDay())) {
          dateArray.push(new Date(currentDate));
        }
        currentDate.setDate(currentDate.getDate() + 1);
      }

      // Create operations for each date
      for (const date of dateArray) {
        const updateData: any = {};
        
        if (operation === 'block') {
          updateData.available = false;
          updateData.blockedBy = reason || 'Bulk operation';
        } else if (operation === 'unblock') {
          updateData.available = true;
          updateData.blockedBy = null;
        } else if (operation === 'set_price') {
          updateData.price = price;
        }

        operations.push(
          prisma.availability.upsert({
            where: {
              propertyId_date: {
                propertyId,
                date,
              },
            },
            update: updateData,
            create: {
              propertyId,
              date,
              ...updateData,
            },
          })
        );
      }
    }

    if (operations.length === 0) {
      return NextResponse.json(
        { error: 'No valid properties or dates to update' },
        { status: 400 }
      );
    }

    // Execute bulk operations
    const results = await prisma.$transaction(operations);

    return NextResponse.json({
      success: true,
      message: `Bulk operation completed: ${operation}`,
      data: {
        operation,
        propertiesUpdated: propertyIds.length,
        datesUpdated: results.length,
        dateRange: {
          startDate: start.toISOString().split('T')[0],
          endDate: end.toISOString().split('T')[0],
        },
        daysOfWeek,
        price,
        reason,
      },
    });

  } catch (error) {
    console.error('Bulk availability operation error:', error);
    return NextResponse.json(
      { error: 'Failed to perform bulk operation' },
      { status: 500 }
    );
  }
}
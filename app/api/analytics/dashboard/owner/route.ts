import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const userId = session.user.id;

    // Get current month start
    const now = new Date();
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);

    // Get user's properties
    const totalProperties = await prisma.property.count({
      where: { userId, isActive: true }
    });

    // Get active bookings (confirmed, not cancelled)
    const activeBookings = await prisma.booking.count({
      where: {
        property: { userId },
        status: { in: ['PENDING', 'CONFIRMED'] },
        endDate: { gte: new Date() }
      }
    });

    // Get monthly revenue
    const [currentMonthRevenue, lastMonthRevenue] = await Promise.all([
      prisma.booking.aggregate({
        where: {
          property: { userId },
          paymentStatus: 'PAID',
          createdAt: { gte: currentMonthStart }
        },
        _sum: { totalAmount: true }
      }),
      prisma.booking.aggregate({
        where: {
          property: { userId },
          paymentStatus: 'PAID',
          createdAt: {
            gte: lastMonthStart,
            lt: currentMonthStart
          }
        },
        _sum: { totalAmount: true }
      })
    ]);

    // Calculate occupancy rate
    const totalBookingDays = await prisma.booking.aggregate({
      where: {
        property: { userId },
        status: { in: ['CONFIRMED', 'COMPLETED'] },
        createdAt: { gte: currentMonthStart }
      },
      _sum: { totalDays: true }
    });

    // Get properties for occupancy calculation
    const propertyCount = totalProperties || 1;
    const daysInMonth = now.getDate();
    const totalAvailableDays = propertyCount * daysInMonth;
    const occupancyRate = totalAvailableDays > 0
      ? ((totalBookingDays._sum.totalDays || 0) / totalAvailableDays * 100).toFixed(0)
      : '0';

    // Get recent bookings
    const recentBookings = await prisma.booking.findMany({
      where: { property: { userId } },
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            name: true,
            email: true
          }
        },
        property: {
          select: {
            title: true
          }
        }
      }
    });

    // Get property performance
    const propertyPerformance = await prisma.booking.groupBy({
      by: ['propertyId'],
      where: {
        property: { userId },
        paymentStatus: 'PAID',
        createdAt: { gte: currentMonthStart }
      },
      _sum: {
        totalAmount: true
      },
      _count: {
        id: true
      }
    });

    const propertyPerformanceWithDetails = await Promise.all(
      propertyPerformance.map(async (perf) => {
        const property = await prisma.property.findUnique({
          where: { id: perf.propertyId },
          select: { title: true }
        });
        
        // Calculate occupancy for this property
        const propertyBookingDays = await prisma.booking.aggregate({
          where: {
            propertyId: perf.propertyId,
            status: { in: ['CONFIRMED', 'COMPLETED'] },
            createdAt: { gte: currentMonthStart }
          },
          _sum: { totalDays: true }
        });

        return {
          name: property?.title || 'Unknown Property',
          revenue: perf._sum.totalAmount || 0,
          bookings: perf._count.id,
          occupancy: daysInMonth > 0 
            ? ((propertyBookingDays._sum.totalDays || 0) / daysInMonth * 100).toFixed(0)
            : '0'
        };
      })
    );

    const stats = {
      totalProperties,
      activeBookings,
      monthlyRevenue: {
        current: currentMonthRevenue._sum.totalAmount || 0,
        last: lastMonthRevenue._sum.totalAmount || 0,
        change: (lastMonthRevenue._sum.totalAmount || 0) > 0
          ? ((((currentMonthRevenue._sum.totalAmount || 0) - (lastMonthRevenue._sum.totalAmount || 0)) / (lastMonthRevenue._sum.totalAmount || 1)) * 100).toFixed(1)
          : '0'
      },
      occupancyRate,
      recentBookings: recentBookings.map(booking => ({
        id: booking.id,
        guest: booking.guestName,
        property: booking.property.title,
        checkIn: booking.startDate,
        checkOut: booking.endDate,
        amount: booking.totalAmount,
        status: booking.status
      })),
      propertyPerformance: propertyPerformanceWithDetails.slice(0, 4)
    };

    return NextResponse.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Owner dashboard stats error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}


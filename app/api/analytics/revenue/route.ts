import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const range = searchParams.get('range') || 'month';
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    // Calculate date ranges
    const now = new Date();
    let start: Date;
    let previousStart: Date;

    switch (range) {
      case 'today':
        start = new Date(now.setHours(0, 0, 0, 0));
        previousStart = new Date(new Date(start).setDate(start.getDate() - 1));
        break;
      case 'week':
        start = new Date(now.setDate(now.getDate() - 7));
        previousStart = new Date(new Date(start).setDate(start.getDate() - 7));
        break;
      case 'month':
        start = new Date(now.setMonth(now.getMonth() - 1));
        previousStart = new Date(new Date(start).setMonth(start.getMonth() - 1));
        break;
      case 'quarter':
        start = new Date(now.setMonth(now.getMonth() - 3));
        previousStart = new Date(new Date(start).setMonth(start.getMonth() - 3));
        break;
      case 'year':
        start = new Date(now.setFullYear(now.getFullYear() - 1));
        previousStart = new Date(new Date(start).setFullYear(start.getFullYear() - 1));
        break;
      default:
        if (startDate && endDate) {
          start = new Date(startDate);
          const end = new Date(endDate);
          const diff = end.getTime() - start.getTime();
          previousStart = new Date(start.getTime() - diff);
        } else {
          start = new Date(now.setMonth(now.getMonth() - 1));
          previousStart = new Date(new Date(start).setMonth(start.getMonth() - 1));
        }
    }

    const end = new Date();

    // Get current period data
    const [bookings, payments, refunds] = await Promise.all([
      prisma.booking.findMany({
        where: {
          status: 'CONFIRMED',
          createdAt: { gte: start, lte: end }
        }
      }),
      prisma.payment.findMany({
        where: {
          status: 'SUCCEEDED',
          createdAt: { gte: start, lte: end }
        }
      }),
      prisma.payment.findMany({
        where: {
          status: 'REFUNDED',
          createdAt: { gte: start, lte: end }
        }
      })
    ]);

    // Get previous period data
    const [prevBookings, prevPayments] = await Promise.all([
      prisma.booking.findMany({
        where: {
          status: 'CONFIRMED',
          createdAt: { gte: previousStart, lt: start }
        }
      }),
      prisma.payment.findMany({
        where: {
          status: 'SUCCEEDED',
          createdAt: { gte: previousStart, lt: start }
        }
      })
    ]);

    // Calculate metrics
    const totalRevenue = payments.reduce((sum, payment) => sum + payment.amount, 0);
    const totalBookings = bookings.length;
    const averageBookingValue = totalBookings > 0 ? totalRevenue / totalBookings : 0;
    const refundedAmount = refunds.reduce((sum, refund) => sum + refund.amount, 0);
    const netRevenue = totalRevenue - refundedAmount;

    const prevTotalRevenue = prevPayments.reduce((sum, payment) => sum + payment.amount, 0);
    const prevTotalBookings = prevBookings.length;
    
    const revenueGrowth = prevTotalRevenue > 0 
      ? ((totalRevenue - prevTotalRevenue) / prevTotalRevenue) * 100 
      : totalRevenue > 0 ? 100 : 0;
    
    const bookingGrowth = prevTotalBookings > 0 
      ? ((totalBookings - prevTotalBookings) / prevTotalBookings) * 100 
      : totalBookings > 0 ? 100 : 0;

    // Get pending payments
    const pendingPayments = await prisma.payment.findMany({
      where: {
        status: 'PENDING',
        createdAt: { gte: start, lte: end }
      }
    });

    const pendingAmount = pendingPayments.reduce((sum, payment) => sum + payment.amount, 0);

    return NextResponse.json({
      success: true,
      data: {
        totalRevenue,
        totalBookings,
        averageBookingValue,
        revenueGrowth,
        bookingGrowth,
        pendingPayments: pendingAmount,
        refundedAmount,
        netRevenue
      }
    });

  } catch (error) {
    console.error('Error fetching revenue analytics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch revenue analytics' },
      { status: 500 }
    );
  }
}
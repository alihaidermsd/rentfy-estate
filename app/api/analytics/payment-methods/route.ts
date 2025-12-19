// app/api/analytics/payment-methods/route.ts
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

    switch (range) {
      case 'today':
        start = new Date(now.setHours(0, 0, 0, 0));
        break;
      case 'week':
        start = new Date(now.setDate(now.getDate() - 7));
        break;
      case 'month':
        start = new Date(now.setMonth(now.getMonth() - 1));
        break;
      case 'quarter':
        start = new Date(now.setMonth(now.getMonth() - 3));
        break;
      case 'year':
        start = new Date(now.setFullYear(now.getFullYear() - 1));
        break;
      default:
        if (startDate && endDate) {
          start = new Date(startDate);
          const end = new Date(endDate);
          return getPaymentMethodsByDateRange(start, end);
        } else {
          start = new Date(now.setMonth(now.getMonth() - 1));
        }
    }

    const end = new Date();
    return getPaymentMethodsByDateRange(start, end);

  } catch (error) {
    console.error('Error fetching payment methods analytics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch payment methods analytics' },
      { status: 500 }
    );
  }
}

async function getPaymentMethodsByDateRange(start: Date, end: Date) {
  try {
    // Get all payments within date range
    const payments = await prisma.payment.findMany({
      where: {
        createdAt: {
          gte: start,
          lte: end
        },
        status: {
          in: ['SUCCEEDED', 'REFUNDED', 'PARTIALLY_REFUNDED']
        }
      },
      select: {
        id: true,
        amount: true,
        status: true,
        paymentMethod: true,
        gateway: true,
        currency: true,
        createdAt: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Group payments by payment method
    const methodStats = new Map<string, {
      method: string;
      count: number;
      total: number;
      refunds: number;
      netAmount: number;
      transactions: any[];
    }>();

    // Process each payment
    payments.forEach(payment => {
      const method = payment.paymentMethod || 'UNKNOWN';
      
      if (!methodStats.has(method)) {
        methodStats.set(method, {
          method,
          count: 0,
          total: 0,
          refunds: 0,
          netAmount: 0,
          transactions: []
        });
      }

      const stats = methodStats.get(method)!;
      stats.count++;
      stats.transactions.push(payment);

      if (payment.status === 'REFUNDED' || payment.status === 'PARTIALLY_REFUNDED') {
        stats.refunds += payment.amount;
      } else {
        stats.total += payment.amount;
      }
    });

    // Calculate net amounts and percentages
    const totalAllPayments = payments.reduce((sum, payment) => {
      if (payment.status === 'SUCCEEDED') {
        return sum + payment.amount;
      }
      return sum;
    }, 0);

    const totalAllRefunds = payments.reduce((sum, payment) => {
      if (payment.status === 'REFUNDED' || payment.status === 'PARTIALLY_REFUNDED') {
        return sum + payment.amount;
      }
      return sum;
    }, 0);

    // Convert map to array and calculate percentages
    const methodsArray = await Promise.all(
      Array.from(methodStats.values()).map(async stats => {
        const netAmount = stats.total - stats.refunds;
        const percentage = totalAllPayments > 0 ? (stats.total / totalAllPayments) * 100 : 0;
        
        return {
          method: stats.method,
          displayName: formatPaymentMethodName(stats.method),
          count: stats.count,
          total: stats.total,
          refunds: stats.refunds,
          netAmount,
          percentage: parseFloat(percentage.toFixed(2)),
          avgTransaction: stats.count > 0 ? stats.total / stats.count : 0,
          successRate: await calculateSuccessRate(stats.method, start, end)
        };
      })
    );

    // Sort by total revenue (highest first)
    methodsArray.sort((a, b) => b.total - a.total);

    // Get payment method trends (last 6 months)
    const trends = await getPaymentMethodTrends(start, end);

    // Get payment method by booking status
    const methodByStatus = await getPaymentMethodsByBookingStatus(start, end);

    // Get top transactions by method
    const topTransactions = await getTopTransactionsByMethod(start, end);

    return NextResponse.json({
      success: true,
      data: {
        methods: methodsArray,
        summary: {
          totalMethods: methodsArray.length,
          totalTransactions: payments.length,
          totalRevenue: totalAllPayments,
          totalRefunds: totalAllRefunds,
          netRevenue: totalAllPayments - totalAllRefunds,
          averageTransactionValue: payments.length > 0 ? totalAllPayments / payments.length : 0
        },
        trends,
        byStatus: methodByStatus,
        topTransactions,
        dateRange: {
          start: start.toISOString(),
          end: end.toISOString()
        }
      }
    });

  } catch (error) {
    console.error('Error in getPaymentMethodsByDateRange:', error);
    throw error;
  }
}

function formatPaymentMethodName(method: string): string {
  const methodMap: Record<string, string> = {
    'CREDIT_CARD': 'Credit Card',
    'DEBIT_CARD': 'Debit Card',
    'PAYPAL': 'PayPal',
    'STRIPE': 'Stripe',
    'BANK_TRANSFER': 'Bank Transfer',
    'CASH': 'Cash',
    'CHECK': 'Check',
    'WIRE_TRANSFER': 'Wire Transfer',
    'MOBILE_PAYMENT': 'Mobile Payment',
    'CRYPTOCURRENCY': 'Cryptocurrency',
    'GOOGLE_PAY': 'Google Pay',
    'APPLE_PAY': 'Apple Pay',
    'UNKNOWN': 'Unknown'
  };

  return methodMap[method] || method.replace('_', ' ').toUpperCase();
}

async function calculateSuccessRate(method: string, start: Date, end: Date): Promise<number> {
  try {
    const payments = await prisma.payment.findMany({
      where: {
        paymentMethod: method,
        createdAt: {
          gte: start,
          lte: end
        }
      },
      select: {
        status: true
      }
    });

    if (payments.length === 0) return 0;

    const successful = payments.filter(p => p.status === 'SUCCEEDED').length;
    return parseFloat(((successful / payments.length) * 100).toFixed(2));
  } catch (error) {
    console.error('Error calculating success rate:', error);
    return 0;
  }
}

async function getPaymentMethodTrends(start: Date, end: Date) {
  try {
    // Get monthly trends for the last 6 months
    const sixMonthsAgo = new Date(end);
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    sixMonthsAgo.setDate(1);
    sixMonthsAgo.setHours(0, 0, 0, 0);

    const payments = await prisma.payment.findMany({
      where: {
        status: 'SUCCEEDED',
        createdAt: {
          gte: sixMonthsAgo,
          lte: end
        }
      },
      select: {
        paymentMethod: true,
        amount: true,
        createdAt: true
      }
    });

    // Group by month and payment method
    const trends = new Map<string, Map<string, number>>();
    const months: string[] = [];
    
    // Initialize all months
    for (let i = 5; i >= 0; i--) {
      const date = new Date(end);
      date.setMonth(date.getMonth() - i);
      const monthKey = date.toLocaleString('default', { month: 'short', year: '2-digit' });
      months.push(monthKey);
      trends.set(monthKey, new Map());
    }

    // Process payments
    payments.forEach(payment => {
      const date = new Date(payment.createdAt);
      const monthKey = date.toLocaleString('default', { month: 'short', year: '2-digit' });
      const method = payment.paymentMethod || 'UNKNOWN';
      
      if (trends.has(monthKey)) {
        const monthData = trends.get(monthKey)!;
        const current = monthData.get(method) || 0;
        monthData.set(method, current + payment.amount);
      }
    });

    // Get all unique methods from the period
    const allMethods = new Set<string>();
    payments.forEach(payment => allMethods.add(payment.paymentMethod || 'UNKNOWN'));

    // Format response
    const formattedTrends = Array.from(allMethods).map(method => {
      const data = months.map(month => {
        const monthData = trends.get(month);
        return monthData ? monthData.get(method) || 0 : 0;
      });

      return {
        method,
        displayName: formatPaymentMethodName(method),
        data,
        total: data.reduce((sum, value) => sum + value, 0),
        growth: calculateGrowthRate(data)
      };
    });

    // Sort by total (highest first)
    formattedTrends.sort((a, b) => b.total - a.total);

    return {
      months,
      methods: formattedTrends.slice(0, 10), // Top 10 methods
      totalMonths: months.length
    };

  } catch (error) {
    console.error('Error getting payment method trends:', error);
    return { months: [], methods: [], totalMonths: 0 };
  }
}

function calculateGrowthRate(data: number[]): number {
  if (data.length < 2) return 0;
  
  const last = data[data.length - 1];
  const previous = data[data.length - 2];
  
  if (previous === 0) return last > 0 ? 100 : 0;
  
  return parseFloat((((last - previous) / previous) * 100).toFixed(2));
}

async function getPaymentMethodsByBookingStatus(start: Date, end: Date) {
  try {
    const bookings = await prisma.booking.findMany({
      where: {
        createdAt: {
          gte: start,
          lte: end
        }
      },
      include: {
        payments: {
          select: {
            paymentMethod: true,
            status: true
          }
        }
      }
    });

    const statusStats = new Map<string, Map<string, number>>();
    
    // Initialize statuses
    const statuses = ['CONFIRMED', 'CANCELLED', 'PENDING', 'COMPLETED', 'NO_SHOW'];
    statuses.forEach(status => statusStats.set(status, new Map()));

    // Process bookings
    bookings.forEach(booking => {
      const status = booking.status;
      const method = booking.paymentMethod || 'UNKNOWN';
      
      if (statusStats.has(status)) {
        const statusData = statusStats.get(status)!;
        const current = statusData.get(method) || 0;
        statusData.set(method, current + 1);
      }
    });

    // Format response
    const formattedStats = statuses.map(status => {
      const methodData = statusStats.get(status)!;
      const total = Array.from(methodData.values()).reduce((sum, count) => sum + count, 0);
      
      const methods = Array.from(methodData.entries()).map(([method, count]) => ({
        method,
        displayName: formatPaymentMethodName(method),
        count,
        percentage: total > 0 ? parseFloat(((count / total) * 100).toFixed(2)) : 0
      }));

      // Sort by count (highest first)
      methods.sort((a, b) => b.count - a.count);

      return {
        status,
        totalBookings: total,
        methods: methods.slice(0, 5) // Top 5 methods per status
      };
    });

    return formattedStats;

  } catch (error) {
    console.error('Error getting payment methods by booking status:', error);
    return [];
  }
}

async function getTopTransactionsByMethod(start: Date, end: Date) {
  try {
    const payments = await prisma.payment.findMany({
      where: {
        status: 'SUCCEEDED',
        createdAt: {
          gte: start,
          lte: end
        }
      },
      include: {
        booking: {
          select: {
            bookingNumber: true,
            guestName: true,
            totalAmount: true
          }
        }
      },
      orderBy: {
        amount: 'desc'
      },
      take: 20
    });

    // Group by payment method
    const groupedByMethod = new Map<string, any[]>();
    
    payments.forEach(payment => {
      const method = payment.paymentMethod || 'UNKNOWN';
      
      if (!groupedByMethod.has(method)) {
        groupedByMethod.set(method, []);
      }
      
      groupedByMethod.get(method)!.push({
        id: payment.id,
        amount: payment.amount,
        currency: payment.currency,
        createdAt: payment.createdAt,
        bookingNumber: payment.booking?.bookingNumber,
        guestName: payment.booking?.guestName,
        bookingTotal: payment.booking?.totalAmount
      });
    });

    // Get top 3 transactions per method
    const topTransactions: any[] = [];
    
    groupedByMethod.forEach((transactions, method) => {
      const sorted = transactions.sort((a, b) => b.amount - a.amount);
      topTransactions.push({
        method,
        displayName: formatPaymentMethodName(method),
        transactions: sorted.slice(0, 3)
      });
    });

    // Sort methods by highest transaction value
    topTransactions.sort((a, b) => {
      const aMax = a.transactions[0]?.amount || 0;
      const bMax = b.transactions[0]?.amount || 0;
      return bMax - aMax;
    });

    return topTransactions.slice(0, 5); // Top 5 methods

  } catch (error) {
    console.error('Error getting top transactions:', error);
    return [];
  }
}

// Optional: POST endpoint to update payment method preferences
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { action, method, enabled } = body;

    // This is where you would update payment method settings in your database
    // For example, enable/disable payment methods, update fees, etc.
    
    switch (action) {
      case 'toggle_method':
        // Update payment method enabled status
        // await prisma.systemSetting.upsert({ ... })
        return NextResponse.json({
          success: true,
          message: `Payment method ${enabled ? 'enabled' : 'disabled'}`,
          data: { method, enabled }
        });

      case 'update_fees':
        // Update payment method fees
        const { processingFee, transactionFee } = body;
        // await prisma.systemSetting.upsert({ ... })
        return NextResponse.json({
          success: true,
          message: 'Fees updated successfully',
          data: { method, processingFee, transactionFee }
        });

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }

  } catch (error) {
    console.error('Error updating payment method:', error);
    return NextResponse.json(
      { error: 'Failed to update payment method' },
      { status: 500 }
    );
  }
}
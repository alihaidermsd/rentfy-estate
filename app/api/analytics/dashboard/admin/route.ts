import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    // Check if user is admin
    if (!session?.user || (session.user.role !== 'ADMIN' && session.user.role !== 'SUPER_ADMIN')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get last month date
    const lastMonth = new Date();
    lastMonth.setMonth(lastMonth.getMonth() - 1);

    // Get total users (all time and last month)
    const [totalUsers, lastMonthUsers] = await Promise.all([
      prisma.user.count({ where: { isActive: true } }),
      prisma.user.count({
        where: {
          isActive: true,
          createdAt: { gte: lastMonth }
        }
      })
    ]);

    // Get total properties (all time and last month)
    const [totalProperties, lastMonthProperties] = await Promise.all([
      prisma.property.count({ where: { status: 'PUBLISHED', isActive: true } }),
      prisma.property.count({
        where: {
          status: 'PUBLISHED',
          isActive: true,
          createdAt: { gte: lastMonth }
        }
      })
    ]);

    // Get total bookings (all time and last month)
    const [totalBookings, lastMonthBookings] = await Promise.all([
      prisma.booking.count(),
      prisma.booking.count({
        where: { createdAt: { gte: lastMonth } }
      })
    ]);

    // Get total revenue (all time and last month)
    const [totalRevenue, lastMonthRevenue] = await Promise.all([
      prisma.booking.aggregate({
        where: { paymentStatus: 'PAID' },
        _sum: { totalAmount: true }
      }),
      prisma.booking.aggregate({
        where: {
          paymentStatus: 'PAID',
          createdAt: { gte: lastMonth }
        },
        _sum: { totalAmount: true }
      })
    ]);

    // Get pending actions
    const [pendingPropertyVerifications, pendingAgentApplications, pendingReports] = await Promise.all([
      prisma.property.count({ where: { verified: false, status: 'PUBLISHED' } }),
      prisma.agent.count({ where: { verified: false } }),
      prisma.inquiry.count({ where: { status: 'PENDING' } })
    ]);

    // Get recent activity (last 10 items)
    const recentActivities = await prisma.auditLog.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            name: true,
            email: true
          }
        }
      }
    });

    const stats = {
      users: {
        total: totalUsers,
        change: totalUsers > 0 ? ((lastMonthUsers / totalUsers) * 100).toFixed(1) : '0'
      },
      properties: {
        total: totalProperties,
        change: totalProperties > 0 ? ((lastMonthProperties / totalProperties) * 100).toFixed(1) : '0'
      },
      bookings: {
        total: totalBookings,
        change: totalBookings > 0 ? ((lastMonthBookings / totalBookings) * 100).toFixed(1) : '0'
      },
      revenue: {
        total: totalRevenue._sum.totalAmount || 0,
        change: (totalRevenue._sum.totalAmount || 0) > 0 
          ? (((lastMonthRevenue._sum.totalAmount || 0) / (totalRevenue._sum.totalAmount || 1)) * 100).toFixed(1)
          : '0'
      },
      pendingActions: {
        propertyVerifications: pendingPropertyVerifications,
        agentApplications: pendingAgentApplications,
        reports: pendingReports
      },
      recentActivity: recentActivities.map(activity => ({
        id: activity.id,
        user: activity.user?.name || 'System',
        action: activity.action,
        entityType: activity.entityType,
        time: activity.createdAt
      }))
    };

    return NextResponse.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Admin dashboard stats error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}


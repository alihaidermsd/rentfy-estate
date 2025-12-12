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

    // Get agent profile
    const agent = await prisma.agent.findUnique({
      where: { userId },
      include: {
        user: {
          select: {
            name: true,
            image: true
          }
        }
      }
    });

    if (!agent) {
      return NextResponse.json(
        { error: 'Agent profile not found' },
        { status: 404 }
      );
    }

    // Get current month
    const now = new Date();
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);

    // Get total listings
    const totalListings = await prisma.property.count({
      where: { agentId: agent.id, isActive: true }
    });

    // Get listings added this month
    const listingsThisMonth = await prisma.property.count({
      where: {
        agentId: agent.id,
        isActive: true,
        createdAt: { gte: currentMonthStart }
      }
    });

    // Get active clients (users who have inquiries or bookings)
    const activeClients = await prisma.user.count({
      where: {
        OR: [
          { inquiries: { some: { agentId: agent.id, status: { not: 'CLOSED' } } } },
          { bookings: { some: { property: { agentId: agent.id }, status: { in: ['PENDING', 'CONFIRMED'] } } } }
        ]
      }
    });

    // Get new clients this week
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const newClientsThisWeek = await prisma.user.count({
      where: {
        OR: [
          { inquiries: { some: { agentId: agent.id, createdAt: { gte: weekAgo } } } },
          { bookings: { some: { property: { agentId: agent.id }, createdAt: { gte: weekAgo } } } }
        ]
      }
    });

    // Get monthly revenue from commissions/transactions
    const [currentMonthRevenue, lastMonthRevenue] = await Promise.all([
      prisma.transaction.aggregate({
        where: {
          agentId: agent.id,
          status: 'COMPLETED',
          createdAt: { gte: currentMonthStart }
        },
        _sum: { amount: true }
      }),
      prisma.transaction.aggregate({
        where: {
          agentId: agent.id,
          status: 'COMPLETED',
          createdAt: {
            gte: lastMonthStart,
            lt: currentMonthStart
          }
        },
        _sum: { amount: true }
      })
    ]);

    // Get pending tasks (inquiries)
    const pendingTasks = await prisma.inquiry.count({
      where: {
        agentId: agent.id,
        status: 'PENDING'
      }
    });

    // Get recent activity
    const recentActivities = await prisma.inquiry.findMany({
      where: { agentId: agent.id },
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        property: {
          select: {
            title: true
          }
        },
        user: {
          select: {
            name: true
          }
        }
      }
    });

    // Get upcoming appointments (inquiries scheduled for viewing)
    const upcomingAppointments = await prisma.inquiry.findMany({
      where: {
        agentId: agent.id,
        status: { in: ['PENDING', 'RESPONDED'] }
      },
      take: 3,
      orderBy: { createdAt: 'asc' },
      include: {
        property: {
          select: {
            title: true
          }
        },
        user: {
          select: {
            name: true
          }
        }
      }
    });

    const stats = {
      agent: {
        name: agent.user.name,
        rating: agent.averageRating || 0,
        image: agent.user.image
      },
      totalListings: {
        total: totalListings,
        thisMonth: listingsThisMonth
      },
      activeClients: {
        total: activeClients,
        newThisWeek: newClientsThisWeek
      },
      monthlyRevenue: {
        current: currentMonthRevenue._sum.amount || 0,
        last: lastMonthRevenue._sum.amount || 0,
        change: (lastMonthRevenue._sum.amount || 0) > 0
          ? ((((currentMonthRevenue._sum.amount || 0) - (lastMonthRevenue._sum.amount || 0)) / (lastMonthRevenue._sum.amount || 1)) * 100).toFixed(1)
          : '0'
      },
      pendingTasks,
      recentActivity: recentActivities.map(activity => ({
        id: activity.id,
        action: activity.message.substring(0, 50) + '...',
        property: activity.property.title,
        client: activity.user?.name || activity.name,
        time: activity.createdAt
      })),
      upcomingAppointments: upcomingAppointments.map(appointment => ({
        id: appointment.id,
        client: appointment.user?.name || appointment.name,
        type: 'Property Viewing',
        property: appointment.property.title,
        date: appointment.createdAt,
        status: appointment.status
      }))
    };

    return NextResponse.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Agent dashboard stats error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}


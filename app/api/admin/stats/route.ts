// app/api/admin/stats/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../auth/[...nextauth]/route'
import {prisma} from '@/lib/db'

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    // Check if user is admin
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Fetch all stats in parallel
    const [
      totalUsers,
      totalProperties,
      totalBookings,
      totalAgents,
      recentUsers,
      recentBookings,
      pendingProperties,
      revenue
    ] = await Promise.all([
      prisma.user.count(),
      prisma.property.count(),
      prisma.booking.count(),
      prisma.user.count({ where: { role: 'agent' } }),
      prisma.user.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: { id: true, name: true, email: true, createdAt: true }
      }),
      prisma.booking.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: {
          property: { select: { title: true } },
          user: { select: { name: true } }
        }
      }),
      prisma.property.count({ where: { status: 'pending' } }),
      prisma.booking.aggregate({
        _sum: { totalPrice: true },
        where: { status: 'confirmed' }
      })
    ])

    return NextResponse.json({
      totals: {
        users: totalUsers,
        properties: totalProperties,
        bookings: totalBookings,
        agents: totalAgents,
        pendingProperties,
        revenue: revenue._sum.totalPrice || 0
      },
      recent: {
        users: recentUsers,
        bookings: recentBookings
      }
    })
  } catch (error) {
    console.error('Admin stats error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
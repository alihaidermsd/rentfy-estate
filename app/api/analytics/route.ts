import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    // Date range setup
    const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Default: last 30 days
    const end = endDate ? new Date(endDate) : new Date()

    const where: any = {
      createdAt: {
        gte: start,
        lte: end
      }
    }

    if (userId) {
      where.userId = userId
    }

    // Get property analytics
    const propertyStats = await prisma.property.groupBy({
      by: ['status', 'type', 'category'],
      where,
      _count: {
        id: true
      },
      _avg: {
        price: true,
        rentPrice: true
      }
    })

    // Get booking analytics
    const bookingStats = await prisma.booking.groupBy({
      by: ['status', 'paymentStatus'],
      where,
      _count: {
        id: true
      },
      _sum: {
        totalAmount: true
      },
      _avg: {
        totalAmount: true,
        totalDays: true
      }
    })

    // Get user analytics
    const userStats = await prisma.user.groupBy({
      by: ['role'],
      where: {
        createdAt: {
          gte: start,
          lte: end
        }
      },
      _count: {
        id: true
      }
    })

    // Get revenue data
    const revenueData = await prisma.booking.aggregate({
      where: {
        ...where,
        paymentStatus: 'PAID'
      },
      _sum: {
        totalAmount: true
      },
      _count: {
        id: true
      }
    })

    // Get popular property types
    const popularProperties = await prisma.property.groupBy({
      by: ['type', 'city'],
      where,
      _count: {
        id: true
      },
      orderBy: {
        _count: {
          id: 'desc'
        }
      },
      take: 10
    })

    const analytics = {
      summary: {
        totalProperties: propertyStats.reduce((acc, item) => acc + item._count.id, 0),
        totalBookings: bookingStats.reduce((acc, item) => acc + item._count.id, 0),
        totalRevenue: revenueData._sum.totalAmount || 0,
        totalUsers: userStats.reduce((acc, item) => acc + item._count.id, 0),
        avgBookingValue: revenueData._count.id > 0 ? (revenueData._sum.totalAmount || 0) / revenueData._count.id : 0
      },
      properties: {
        byStatus: propertyStats.reduce((acc: any, item) => {
          acc[item.status] = item._count.id
          return acc
        }, {}),
        byType: propertyStats.reduce((acc: any, item) => {
          acc[item.type] = (acc[item.type] || 0) + item._count.id
          return acc
        }, {}),
        byCategory: propertyStats.reduce((acc: any, item) => {
          acc[item.category] = (acc[item.category] || 0) + item._count.id
          return acc
        }, {}),
        avgPrices: {
          sale: propertyStats
            .filter(item => item.category === 'SALE' && item._avg.price)
            .reduce((acc, item) => acc + (item._avg.price || 0), 0) / 
            propertyStats.filter(item => item.category === 'SALE' && item._avg.price).length || 0,
          rent: propertyStats
            .filter(item => item.category === 'RENT' && item._avg.rentPrice)
            .reduce((acc, item) => acc + (item._avg.rentPrice || 0), 0) / 
            propertyStats.filter(item => item.category === 'RENT' && item._avg.rentPrice).length || 0
        }
      },
      bookings: {
        byStatus: bookingStats.reduce((acc: any, item) => {
          acc[item.status] = item._count.id
          return acc
        }, {}),
        byPaymentStatus: bookingStats.reduce((acc: any, item) => {
          acc[item.paymentStatus] = item._count.id
          return acc
        }, {}),
        revenue: bookingStats.reduce((acc: any, item) => {
          acc[item.status] = item._sum.totalAmount || 0
          return acc
        }, {}),
        avgBooking: {
          amount: bookingStats.reduce((acc, item) => acc + (item._avg.totalAmount || 0), 0) / bookingStats.length || 0,
          days: bookingStats.reduce((acc, item) => acc + (item._avg.totalDays || 0), 0) / bookingStats.length || 0
        }
      },
      users: {
        byRole: userStats.reduce((acc: any, item) => {
          acc[item.role] = item._count.id
          return acc
        }, {})
      },
      popular: {
        properties: popularProperties
      },
      dateRange: {
        start: start.toISOString(),
        end: end.toISOString()
      }
    }

    return NextResponse.json({
      success: true,
      data: analytics
    })
  } catch (error) {
    console.error('Analytics fetch error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
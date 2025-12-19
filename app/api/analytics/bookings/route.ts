import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const propertyId = searchParams.get('propertyId')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const groupBy = searchParams.get('groupBy') || 'month' // day, week, month, year

    // Date range setup
    const start = startDate ? new Date(startDate) : new Date(Date.now() - 90 * 24 * 60 * 60 * 1000) // Default: last 90 days
    const end = endDate ? new Date(endDate) : new Date()

    const where: any = {
      createdAt: {
        gte: start,
        lte: end
      }
    }

    if (userId) where.userId = userId
    if (propertyId) where.propertyId = propertyId

    // Booking statistics
    const bookingStats = await prisma.booking.groupBy({
      by: ['status', 'paymentStatus'],
      where,
      _count: {
        id: true
      },
      _sum: {
        totalAmount: true,
        cleaningFee: true,
        serviceFee: true,
        taxAmount: true
      },
      _avg: {
        totalAmount: true,
        totalDays: true,
        guests: true
      }
    })

    // Booking trend over time
    const bookingTrend = await prisma.booking.groupBy({
      by: ['createdAt'],
      where,
      _count: {
        id: true
      },
      _sum: {
        totalAmount: true
      },
      orderBy: {
        createdAt: 'asc'
      }
    })

    // Revenue analysis
    const revenueAnalysis = await prisma.booking.groupBy({
      by: ['status'],
      where: {
        ...where,
        paymentStatus: 'PAID'
      },
      _sum: {
        totalAmount: true,
        cleaningFee: true,
        serviceFee: true,
        taxAmount: true
      },
      _count: {
        id: true
      }
    })

    // Property performance in bookings
    const propertyPerformance = await prisma.booking.groupBy({
      by: ['propertyId'],
      where,
      _count: {
        id: true
      },
      _sum: {
        totalAmount: true
      },
      orderBy: {
        _count: {
          id: 'desc'
        }
      },
      take: 20
    })

    // Get property details for top performers
    const topPropertyIds = propertyPerformance.map(item => item.propertyId)
    const propertyDetails = await prisma.property.findMany({
      where: {
        id: { in: topPropertyIds }
      },
      select: {
        id: true,
        title: true,
        type: true,
        city: true,
        images: true
      }
    })

    // Guest analysis
    const guestAnalysis = await prisma.booking.groupBy({
      by: ['guests'],
      where,
      _count: {
        id: true
      },
      orderBy: {
        guests: 'asc'
      }
    })

    // Duration analysis
    const durationAnalysis = await prisma.booking.groupBy({
      by: ['totalDays'],
      where,
      _count: {
        id: true
      },
      orderBy: {
        totalDays: 'asc'
      }
    })

    // Seasonal analysis (by month)
    const seasonalData = await prisma.booking.findMany({
      where,
      select: {
        startDate: true,
        totalAmount: true,
        status: true
      }
    })

    const monthlyBreakdown = seasonalData.reduce((acc: any, booking) => {
      const month = booking.startDate.getMonth()
      const year = booking.startDate.getFullYear()
      const key = `${year}-${month + 1}`
      
      if (!acc[key]) {
        acc[key] = {
          bookings: 0,
          revenue: 0,
          confirmed: 0
        }
      }
      
      acc[key].bookings++
      if (booking.status === 'CONFIRMED') {
        acc[key].revenue += booking.totalAmount
        acc[key].confirmed++
      }
      
      return acc
    }, {})

    const analytics = {
      summary: {
        totalBookings: bookingStats.reduce((acc, item) => acc + item._count.id, 0),
        confirmedBookings: bookingStats.filter(item => item.status === 'CONFIRMED').reduce((acc, item) => acc + item._count.id, 0),
        totalRevenue: bookingStats.reduce((acc, item) => acc + (item._sum.totalAmount || 0), 0),
        paidRevenue: revenueAnalysis.reduce((acc, item) => acc + (item._sum.totalAmount || 0), 0),
        avgBookingValue: bookingStats.reduce((acc, item) => acc + (item._avg.totalAmount || 0), 0) / bookingStats.length || 0,
        avgStayDuration: bookingStats.reduce((acc, item) => acc + (item._avg.totalDays || 0), 0) / bookingStats.length || 0
      },
      distribution: {
        byStatus: bookingStats.reduce((acc: any, item) => {
          acc[item.status] = {
            count: item._count.id,
            revenue: item._sum.totalAmount || 0
          }
          return acc
        }, {}),
        byPaymentStatus: bookingStats.reduce((acc: any, item) => {
          acc[item.paymentStatus] = item._count.id
          return acc
        }, {})
      },
      revenue: {
        total: revenueAnalysis.reduce((acc, item) => acc + (item._sum.totalAmount || 0), 0),
        fees: {
          cleaning: revenueAnalysis.reduce((acc, item) => acc + (item._sum.cleaningFee || 0), 0),
          service: revenueAnalysis.reduce((acc, item) => acc + (item._sum.serviceFee || 0), 0),
          tax: revenueAnalysis.reduce((acc, item) => acc + (item._sum.taxAmount || 0), 0)
        },
        byStatus: revenueAnalysis.reduce((acc: any, item) => {
          acc[item.status] = item._sum.totalAmount || 0
          return acc
        }, {})
      },
      performance: {
        topProperties: propertyPerformance.map(item => {
          const property = propertyDetails.find(p => p.id === item.propertyId)
          return {
            property: property ? {
              ...property,
              images: property.images ? property.images.split(',').filter(Boolean) : []
            } : null,
            bookings: item._count.id,
            revenue: item._sum.totalAmount || 0
          }
        }).filter(item => item.property !== null)
      },
      guestAnalysis: {
        byGroupSize: guestAnalysis.reduce((acc: any, item) => {
          acc[item.guests] = item._count.id
          return acc
        }, {}),
        avgGuests: bookingStats.reduce((acc, item) => acc + (item._avg.guests || 0), 0) / bookingStats.length || 0
      },
      durationAnalysis: {
        byDays: durationAnalysis.reduce((acc: any, item) => {
          acc[item.totalDays] = item._count.id
          return acc
        }, {}),
        avgDuration: bookingStats.reduce((acc, item) => acc + (item._avg.totalDays || 0), 0) / bookingStats.length || 0
      },
      trends: {
        booking: bookingTrend.map(item => ({
          date: item.createdAt.toISOString().split('T')[0],
          bookings: item._count.id,
          revenue: item._sum.totalAmount || 0
        })),
        seasonal: Object.entries(monthlyBreakdown).map(([key, value]: [string, any]) => ({
          period: key,
          ...value
        }))
      },
      insights: {
        conversionRate: bookingStats.reduce((acc, item) => acc + item._count.id, 0) > 0 
          ? (bookingStats.filter(item => item.status === 'CONFIRMED').reduce((acc, item) => acc + item._count.id, 0) / 
             bookingStats.reduce((acc, item) => acc + item._count.id, 0)) * 100 
          : 0,
        mostPopularGuestSize: guestAnalysis.reduce((max, item) => 
          item._count.id > max._count.id ? item : guestAnalysis[0]
        ),
        mostCommonDuration: durationAnalysis.reduce((max, item) => 
          item._count.id > max._count.id ? item : durationAnalysis[0]
        )
      }
    }

    return NextResponse.json({
      success: true,
      data: analytics
    })
  } catch (error) {
    console.error('Booking analytics fetch error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
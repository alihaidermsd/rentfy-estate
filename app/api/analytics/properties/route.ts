import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const agentId = searchParams.get('agentId')
    const developerId = searchParams.get('developerId')
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
    if (agentId) where.agentId = agentId
    if (developerId) where.developerId = developerId

    // Property statistics
    const propertyStats = await prisma.property.groupBy({
      by: ['status', 'type', 'category', 'city'],
      where,
      _count: {
        id: true
      },
      _avg: {
        price: true,
        rentPrice: true,
        area: true,
        bedrooms: true,
        bathrooms: true
      }
    })

    // Property creation trend
    const creationTrend = await prisma.property.groupBy({
      by: ['createdAt'],
      where,
      _count: {
        id: true
      },
      orderBy: {
        createdAt: 'asc'
      }
    })

    // Property performance (with bookings and reviews)
    const propertiesWithStats = await prisma.property.findMany({
      where,
      select: {
        id: true,
        title: true,
        type: true,
        category: true,
        city: true,
        status: true,
        price: true,
        rentPrice: true,
        featured: true,
        verified: true,
        createdAt: true,
        _count: {
          select: {
            bookings: {
              where: {
                status: 'CONFIRMED'
              }
            },
            reviews: true,
            favorites: true
          }
        },
        reviews: {
          select: {
            rating: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 50
    })

    // Calculate performance metrics
    const performanceData = propertiesWithStats.map(property => {
      const avgRating = property.reviews.length > 0 
        ? property.reviews.reduce((acc: number, review: { rating: number }) => acc + review.rating, 0) / property.reviews.length 
        : 0

      return {
        ...property,
        avgRating,
        performanceScore: calculatePerformanceScore(property, avgRating)
      }
    })

    // City-wise distribution
    const cityDistribution = await prisma.property.groupBy({
      by: ['city', 'state'],
      where,
      _count: {
        id: true
      },
      _avg: {
        price: true,
        rentPrice: true
      },
      orderBy: {
        _count: {
          id: 'desc'
        }
      }
    })

    // Price range analysis
    const priceRanges = await prisma.property.aggregate({
      where: {
        ...where,
        OR: [
          { price: { not: null } },
          { rentPrice: { not: null } }
        ]
      },
      _min: {
        price: true,
        rentPrice: true
      },
      _max: {
        price: true,
        rentPrice: true
      },
      _avg: {
        price: true,
        rentPrice: true
      }
    })

    const analytics = {
      summary: {
        totalProperties: propertyStats.reduce((acc, item) => acc + item._count.id, 0),
        published: propertyStats.filter(item => item.status === 'PUBLISHED').reduce((acc, item) => acc + item._count.id, 0),
        sold: propertyStats.filter(item => item.status === 'SOLD').reduce((acc, item) => acc + item._count.id, 0),
        rented: propertyStats.filter(item => item.status === 'RENTED').reduce((acc, item) => acc + item._count.id, 0),
        featured: propertiesWithStats.filter(p => p.featured).length,
        verified: propertiesWithStats.filter(p => p.verified).length
      },
      distribution: {
        byStatus: propertyStats.reduce((acc: any, item) => {
          acc[item.status] = (acc[item.status] || 0) + item._count.id
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
        byCity: cityDistribution.reduce((acc: any, item) => {
          const key = `${item.city}, ${item.state}`
          acc[key] = item._count.id
          return acc
        }, {})
      },
      pricing: {
        sale: {
          min: priceRanges._min.price,
          max: priceRanges._max.price,
          avg: priceRanges._avg.price
        },
        rent: {
          min: priceRanges._min.rentPrice,
          max: priceRanges._max.rentPrice,
          avg: priceRanges._avg.rentPrice
        }
      },
      performance: {
        topPerforming: performanceData
          .sort((a, b) => b.performanceScore - a.performanceScore)
          .slice(0, 10),
        lowPerforming: performanceData
          .sort((a, b) => a.performanceScore - b.performanceScore)
          .slice(0, 10)
      },
      trends: {
        creation: creationTrend.map(item => ({
          date: item.createdAt.toISOString().split('T')[0],
          count: item._count.id
        }))
      },
      insights: {
        mostPopularType: propertyStats.reduce((max, item) => 
          item._count.id > max._count.id ? item : max
        ),
        highestAvgPrice: propertyStats.reduce((max, item) => 
          (item._avg.price || 0) > (max._avg.price || 0) ? item : max
        ),
        mostActiveCity: cityDistribution[0]
      }
    }

    return NextResponse.json({
      success: true,
      data: analytics
    })
  } catch (error) {
    console.error('Property analytics fetch error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Helper function to calculate property performance score
function calculatePerformanceScore(property: any, avgRating: number): number {
  let score = 0
  
  // Booking count weight
  score += property._count.bookings * 10
  
  // Favorite count weight
  score += property._count.favorites * 2
  
  // Review count and rating weight
  score += property._count.reviews * 5
  score += avgRating * 20
  
  // Featured property bonus
  if (property.featured) score += 50
  
  // Verified property bonus
  if (property.verified) score += 30
  
  return Math.round(score)
}
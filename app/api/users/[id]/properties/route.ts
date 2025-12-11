import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const status = searchParams.get('status')
    const category = searchParams.get('category')
    const type = searchParams.get('type')

    const skip = (page - 1) * limit
    
    const where: any = { userId: params.id }
    if (status) where.status = status
    if (category) where.category = category
    if (type) where.type = type

    const [properties, total] = await Promise.all([
      prisma.property.findMany({
        where,
        include: {
          reviews: {
            select: {
              rating: true
            }
          },
          bookings: {
            select: {
              id: true,
              status: true
            }
          },
          favorites: true,
          agent: {
            select: {
              id: true,
              company: true,
              user: {
                select: {
                  name: true
                }
              }
            }
          },
          developer: {
            select: {
              id: true,
              companyName: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      prisma.property.count({ where })
    ])

    const propertiesWithStats = properties.map(property => {
      const averageRating = property.reviews.length > 0 
        ? property.reviews.reduce((acc: number, review: { rating: number }) => acc + review.rating, 0) / property.reviews.length 
        : 0

      const confirmedBookings = property.bookings.filter(booking => 
        booking.status === 'CONFIRMED'
      ).length

      return {
        ...property,
        amenities: JSON.parse(property.amenities || '[]'),
        images: JSON.parse(property.images || '[]'),
        averageRating,
        totalReviews: property.reviews.length,
        totalBookings: property.bookings.length,
        confirmedBookings,
        totalFavorites: property.favorites.length
      }
    })

    return NextResponse.json({
      success: true,
      data: propertiesWithStats,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('User properties fetch error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
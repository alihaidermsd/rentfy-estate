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

    const skip = (page - 1) * limit
    
    const where = { userId: params.id }

    const [favorites, total] = await Promise.all([
      prisma.favorite.findMany({
        where,
        include: {
          property: {
            include: {
              user: {
                select: {
                  name: true,
                  email: true,
                  image: true
                }
              },
              reviews: {
                select: {
                  rating: true
                }
              },
              favorites: {
                where: { userId: params.id },
                select: { id: true }
              }
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      prisma.favorite.count({ where })
    ])

    const favoritesWithPropertyDetails = favorites.map(favorite => {
      const averageRating = favorite.property.reviews.length > 0 
        ? favorite.property.reviews.reduce((acc: number, review: { rating: number }) => acc + review.rating, 0) / favorite.property.reviews.length 
        : 0

      return {
        id: favorite.id,
        createdAt: favorite.createdAt,
        property: {
          ...favorite.property,
          amenities: JSON.parse(favorite.property.amenities || '[]'),
          images: JSON.parse(favorite.property.images || '[]'),
          averageRating,
          totalReviews: favorite.property.reviews.length,
          isFavorite: favorite.property.favorites.length > 0
        }
      }
    })

    return NextResponse.json({
      success: true,
      data: favoritesWithPropertyDetails,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('User favorites fetch error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { propertyId } = body

    if (!propertyId) {
      return NextResponse.json(
        { error: 'propertyId is required' },
        { status: 400 }
      )
    }

    // Check if property exists
    const property = await prisma.property.findUnique({
      where: { id: propertyId }
    })

    if (!property) {
      return NextResponse.json(
        { error: 'Property not found' },
        { status: 404 }
      )
    }

    // Check if already favorited
    const existingFavorite = await prisma.favorite.findUnique({
      where: {
        userId_propertyId: {
          userId: params.id,
          propertyId
        }
      }
    })

    if (existingFavorite) {
      return NextResponse.json(
        { error: 'Property is already in favorites' },
        { status: 400 }
      )
    }

    const favorite = await prisma.favorite.create({
      data: {
        userId: params.id,
        propertyId
      },
      include: {
        property: {
          select: {
            id: true,
            title: true,
            images: true
          }
        }
      }
    })

    const favoriteWithParsedImages = {
      ...favorite,
      property: {
        ...favorite.property,
        images: JSON.parse(favorite.property.images || '[]')
      }
    }

    return NextResponse.json(
      { 
        success: true,
        message: 'Property added to favorites',
        data: favoriteWithParsedImages 
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Add to favorites error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { searchParams } = new URL(request.url)
    const propertyId = searchParams.get('propertyId')

    if (!propertyId) {
      return NextResponse.json(
        { error: 'propertyId is required' },
        { status: 400 }
      )
    }

    await prisma.favorite.delete({
      where: {
        userId_propertyId: {
          userId: params.id,
          propertyId
        }
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Property removed from favorites'
    })
  } catch (error) {
    console.error('Remove from favorites error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
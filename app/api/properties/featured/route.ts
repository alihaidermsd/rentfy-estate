import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '6');
    const type = searchParams.get('type');
    const category = searchParams.get('category');

    const where: any = {
      featured: true,
      isActive: true,
      status: 'PUBLISHED',
    };

    if (type) where.type = type;
    if (category) where.category = category;

    const properties = await prisma.property.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        agent: {
          select: {
            id: true,
            user: {
              select: {
                name: true,
                image: true,
              },
            },
            company: true,
            verified: true,
          },
        },
        _count: {
          select: {
            favorites: true,
            reviews: true,
          },
        },
      },
      orderBy: {
        featuredUntil: 'desc',
        views: 'desc',
        createdAt: 'desc',
      },
      take: limit,
    });

    // Add average ratings
    const propertiesWithRatings = await Promise.all(
      properties.map(async (property) => {
        const reviews = await prisma.review.findMany({
          where: { propertyId: property.id, status: 'APPROVED' },
          select: { rating: true },
        });
        
        const averageRating = reviews.length > 0
          ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
          : null;

        return {
          ...property,
          averageRating,
          totalReviews: reviews.length,
        };
      })
    );

    return NextResponse.json({
      success: true,
      data: propertiesWithRatings,
    });

  } catch (error) {
    console.error('Error fetching featured properties:', error);
    return NextResponse.json(
      { error: 'Failed to fetch featured properties' },
      { status: 500 }
    );
  }
}
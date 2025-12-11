import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

const prisma = new PrismaClient();

export const dynamic = 'force-dynamic'

// Advanced search schema
const searchSchema = z.object({
  query: z.string().min(1, 'Search query is required'),
  type: z.string().optional(),
  category: z.string().optional(),
  city: z.string().optional(),
  minPrice: z.string().optional().transform(Number),
  maxPrice: z.string().optional().transform(Number),
  bedrooms: z.string().optional().transform(Number),
  bathrooms: z.string().optional().transform(Number),
  limit: z.string().optional().default('10').transform(Number),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const params = Object.fromEntries(searchParams.entries());
    
    const validation = searchSchema.safeParse(params);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid search parameters', details: validation.error.issues },
        { status: 400 }
      );
    }

    const { query, type, category, city, minPrice, maxPrice, bedrooms, bathrooms, limit } = validation.data;

    const where: any = {
      isActive: true,
      status: 'PUBLISHED',
      OR: [
        { title: { contains: query, mode: 'insensitive' } },
        { description: { contains: query, mode: 'insensitive' } },
        { address: { contains: query, mode: 'insensitive' } },
        { city: { contains: query, mode: 'insensitive' } },
        { state: { contains: query, mode: 'insensitive' } },
        { neighborhood: { contains: query, mode: 'insensitive' } },
        { landmark: { contains: query, mode: 'insensitive' } },
      ],
    };

    if (type) where.type = type;
    if (category) where.category = category;
    if (city) where.city = { contains: city, mode: 'insensitive' };
    if (bedrooms !== undefined) where.bedrooms = { gte: bedrooms };
    if (bathrooms !== undefined) where.bathrooms = { gte: bathrooms };

    // Price filter
    if (minPrice !== undefined || maxPrice !== undefined) {
      const priceFilter: any = {};
      if (minPrice !== undefined) priceFilter.gte = minPrice;
      if (maxPrice !== undefined) priceFilter.lte = maxPrice;
      
      where.OR = [
        { price: priceFilter },
        { rentPrice: priceFilter },
      ];
    }

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
        _count: {
          select: {
            favorites: true,
            reviews: true,
          },
        },
      },
      orderBy: {
        featured: 'desc',
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
      count: properties.length,
    });

  } catch (error) {
    console.error('Error searching properties:', error);
    return NextResponse.json(
      { error: 'Failed to search properties' },
      { status: 500 }
    );
  }
}
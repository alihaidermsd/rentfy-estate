import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

export const dynamic = 'force-dynamic'

// Advanced search schema
const searchSchema = z.object({
  query: z.string().optional(), // Made query optional
  type: z.string().optional(),
  category: z.string().optional(),
  city: z.string().optional(),
  minPrice: z.string().optional().transform(Number),
  maxPrice: z.string().optional().transform(Number),
  bedrooms: z.string().optional().transform(Number),
  bathrooms: z.string().optional().transform(Number),
  limit: z.string().optional().default('1000').transform(Number),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const params = Object.fromEntries(searchParams.entries());
    
    // Validate and parse parameters, allowing query to be absent
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
    };

    // Build query conditions
    const queryConditions: any[] = [];
    if (query && query.trim()) {
      // SQLite's contains is case-sensitive, but we'll search as-is
      // For better results, you could use Prisma's raw query with LOWER() if needed
      const searchTerm = query.trim();
      queryConditions.push(
        { title: { contains: searchTerm } },
        { description: { contains: searchTerm } },
        { address: { contains: searchTerm } },
        { city: { contains: searchTerm } },
        { state: { contains: searchTerm } },
        { neighborhood: { contains: searchTerm } },
        { landmark: { contains: searchTerm } }
      );
    }

    // Price filter conditions
    const priceConditions: any[] = [];
    if (minPrice !== undefined || maxPrice !== undefined) {
      const priceFilter: any = {};
      if (minPrice !== undefined) priceFilter.gte = minPrice;
      if (maxPrice !== undefined) priceFilter.lte = maxPrice;
      
      priceConditions.push(
        { price: priceFilter },
        { rentPrice: priceFilter }
      );
    }

    // Combine OR conditions if we have both query and price filters
    if (queryConditions.length > 0 && priceConditions.length > 0) {
      where.AND = [
        { OR: queryConditions },
        { OR: priceConditions }
      ];
    } else if (queryConditions.length > 0) {
      where.OR = queryConditions;
    } else if (priceConditions.length > 0) {
      where.OR = priceConditions;
    }

    // Other filters
    if (type) where.type = type;
    if (category) where.category = category;
    if (city && city.trim()) where.city = { contains: city.trim() };
    if (bedrooms !== undefined && bedrooms !== null) where.bedrooms = { gte: bedrooms };
    if (bathrooms !== undefined && bathrooms !== null) where.bathrooms = { gte: bathrooms };

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

    // Get total count for pagination
    const total = await prisma.property.count({ where });

    return NextResponse.json({
      success: true,
      data: propertiesWithRatings,
      count: properties.length,
      pagination: {
        total,
        limit,
        count: properties.length,
      },
    });

  } catch (error) {
    console.error('Error searching properties:', error);
    return NextResponse.json(
      { error: 'Failed to search properties' },
      { status: 500 }
    );
  }
}
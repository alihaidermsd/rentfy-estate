import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth';

// GET /api/properties/[id]/favorites - Check if property is favorited
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if property exists
    const property = await prisma.property.findUnique({
      where: { id },
      select: { id: true, isActive: true },
    });

    if (!property || !property.isActive) {
      return NextResponse.json(
        { error: 'Property not found or inactive' },
        { status: 404 }
      );
    }

    // Check if property is favorited
    const favorite = await prisma.favorite.findUnique({
      where: {
        userId_propertyId: {
          userId,
          propertyId: id,
        },
      },
      select: {
        id: true,
        createdAt: true,
      },
    });

    // Get total favorites count for the property
    const favoritesCount = await prisma.favorite.count({
      where: { propertyId: id },
    });

    return NextResponse.json({
      success: true,
      data: {
        isFavorited: !!favorite,
        favoriteId: favorite?.id,
        favoritedAt: favorite?.createdAt,
        totalFavorites: favoritesCount,
      },
    });

  } catch (error) {
    console.error('Favorite check error:', error);
    return NextResponse.json(
      { error: 'Failed to check favorite status' },
      { status: 500 }
    );
  }
}

// POST /api/properties/[id]/favorites - Add property to favorites
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if property exists
    const property = await prisma.property.findUnique({
      where: { id },
      select: { id: true, isActive: true, userId: true },
    });

    if (!property || !property.isActive) {
      return NextResponse.json(
        { error: 'Property not found or inactive' },
        { status: 404 }
      );
    }

    // Prevent users from favoriting their own property
    if (property.userId === userId) {
      return NextResponse.json(
        { error: 'Cannot favorite your own property' },
        { status: 400 }
      );
    }

    // Check if already favorited
    const existingFavorite = await prisma.favorite.findUnique({
      where: {
        userId_propertyId: {
          userId,
          propertyId: id,
        },
      },
    });

    if (existingFavorite) {
      return NextResponse.json(
        { error: 'Property already in favorites' },
        { status: 400 }
      );
    }

    // Add to favorites
    const favorite = await prisma.favorite.create({
      data: {
        userId,
        propertyId: id,
      },
    });

    // Update property favorites count
    await prisma.property.update({
      where: { id },
      data: {},
    });

    return NextResponse.json({
      success: true,
      message: 'Property added to favorites',
      data: favorite,
    });

  } catch (error: any) {
    console.error('Favorite add error:', error);
    
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'Property already in favorites' },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to add to favorites' },
      { status: 500 }
    );
  }
}

// DELETE /api/properties/[id]/favorites - Remove property from favorites
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if favorite exists
    const favorite = await prisma.favorite.findUnique({
      where: {
        userId_propertyId: {
          userId,
          propertyId: id,
        },
      },
    });

    if (!favorite) {
      return NextResponse.json(
        { error: 'Property not in favorites' },
        { status: 404 }
      );
    }

    // Remove from favorites
    await prisma.favorite.delete({
      where: {
        userId_propertyId: {
          userId,
          propertyId: id,
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Property removed from favorites',
    });

  } catch (error: any) {
    console.error('Favorite remove error:', error);
    
    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Favorite not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to remove from favorites' },
      { status: 500 }
    );
  }
}
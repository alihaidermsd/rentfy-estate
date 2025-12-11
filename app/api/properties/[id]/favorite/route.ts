import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { PrismaClient } from '@prisma/client';
import { authOptions } from '@/lib/auth';

const prisma = new PrismaClient();

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: propertyId } = params;
    const userId = session.user.id;

    const existingFavorite = await prisma.favorite.findUnique({
      where: {
        userId_propertyId: {
          userId,
          propertyId,
        },
      },
    });

    if (existingFavorite) {
      return NextResponse.json(
        { message: 'Property already favorited' },
        { status: 200 }
      );
    }

    const favorite = await prisma.favorite.create({
      data: {
        userId,
        propertyId,
      },
    });

    return NextResponse.json({
      success: true,
      data: favorite,
      message: 'Property added to favorites',
    });
  } catch (error) {
    console.error('Error favoriting property:', error);
    return NextResponse.json(
      { error: 'Failed to favorite property' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: propertyId } = params;
    const userId = session.user.id;

    await prisma.favorite.delete({
      where: {
        userId_propertyId: {
          userId,
          propertyId,
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Property removed from favorites',
    });
  } catch (error) {
    console.error('Error unfavoriting property:', error);
    return NextResponse.json(
      { error: 'Failed to unfavorite property' },
      { status: 500 }
    );
  }
}

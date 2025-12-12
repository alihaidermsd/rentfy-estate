import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const userId = session.user.id;

    // Get user's bookings count
    const totalBookings = await prisma.booking.count({
      where: { userId }
    });

    // Get user's favorites count
    const totalFavorites = await prisma.favorite.count({
      where: { userId }
    });

    // Get user's inquiries count
    const totalInquiries = await prisma.inquiry.count({
      where: { userId }
    });

    const stats = {
      bookings: totalBookings,
      favorites: totalFavorites,
      inquiries: totalInquiries
    };

    return NextResponse.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('User dashboard stats error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}


import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth';

// POST /api/bookings/[id]/confirm - Confirm a booking
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

    const booking = await prisma.booking.findUnique({
      where: { id },
      include: {
        property: {
          select: {
            userId: true,
            agentId: true,
            title: true,
            instantBook: true,
          },
        },
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    if (!booking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      );
    }

    // Check permissions
    const isPropertyOwner = booking.property.userId === userId;
    const isAgent = booking.property.agentId === userId;
    const isAdmin = session.user.role === 'ADMIN';

    if (!isPropertyOwner && !isAgent && !isAdmin) {
      return NextResponse.json(
        { error: 'You do not have permission to confirm this booking' },
        { status: 403 }
      );
    }

    // Check if booking can be confirmed
    if (booking.status !== 'PENDING') {
      return NextResponse.json(
        { 
          error: `Booking cannot be confirmed. Current status: ${booking.status}`,
          allowedStatus: ['PENDING'],
        },
        { status: 400 }
      );
    }

    // Update booking status
    const updatedBooking = await prisma.booking.update({
      where: { id },
      data: {
        status: 'CONFIRMED',
        confirmedAt: new Date(),
      },
      include: {
        property: {
          select: {
            title: true,
            address: true,
          },
        },
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    // Log the confirmation
    await prisma.auditLog.create({
      data: {
        userId,
        action: 'CONFIRM',
        entityType: 'BOOKING',
        entityId: id,
        oldData: JSON.stringify({ status: booking.status }),
        newData: JSON.stringify({ status: 'CONFIRMED', confirmedAt: new Date() }),
        ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown',
      },
    });

    // Send confirmation notification (in production)
    console.log(`Booking ${id} confirmed by user ${userId}`);
    console.log(`Guest: ${booking.user.name} (${booking.user.email})`);
    console.log(`Property: ${booking.property.title}`);

    return NextResponse.json({
      success: true,
      message: 'Booking confirmed successfully',
      data: {
        booking: updatedBooking,
        nextSteps: [
          'Send confirmation email to guest',
          'Prepare property for check-in',
          'Share check-in instructions',
        ],
      },
    });

  } catch (error: any) {
    console.error('Booking confirmation error:', error);
    
    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to confirm booking' },
      { status: 500 }
    );
  }
}
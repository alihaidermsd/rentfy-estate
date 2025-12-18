import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { authOptions } from '@/lib/auth';

// Validation schema for cancellation
const cancelBookingSchema = z.object({
  reason: z.string().min(1).max(500),
  refundAmount: z.number().min(0).optional(),
  notifyGuest: z.boolean().optional().default(true),
  cancellationPolicy: z.enum(['FULL_REFUND', 'PARTIAL_REFUND', 'NO_REFUND']).optional(),
});

// POST /api/bookings/[id]/cancel - Cancel a booking
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

    const body = await request.json();
    const validation = cancelBookingSchema.safeParse(body);
    
    if (!validation.success) {
      return NextResponse.json(
        { 
          error: 'Invalid cancellation data', 
          details: validation.error.issues 
        },
        { status: 400 }
      );
    }

    const { reason, refundAmount, notifyGuest, cancellationPolicy } = validation.data;

    const booking = await prisma.booking.findUnique({
      where: { id },
      include: {
        property: {
          select: {
            userId: true,
            agentId: true,
            title: true,
            cancellationPolicy: true,
            user: {
              select: {
                name: true,
                email: true,
              },
            },
          },
        },
        user: {
          select: {
            name: true,
            email: true,
          },
        },
        payments: {
          where: {
            status: 'SUCCEEDED',
          },
          orderBy: { createdAt: 'desc' },
          take: 1,
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
    const isGuest = booking.userId === userId;
    const isPropertyOwner = booking.property.userId === userId;
    const isAgent = booking.property.agentId === userId;
    const isAdmin = session.user.role === 'ADMIN';

    if (!isGuest && !isPropertyOwner && !isAgent && !isAdmin) {
      return NextResponse.json(
        { error: 'You do not have permission to cancel this booking' },
        { status: 403 }
      );
    }

    // Check if booking can be cancelled
    if (booking.status === 'CANCELLED') {
      return NextResponse.json(
        { error: 'Booking is already cancelled' },
        { status: 400 }
      );
    }

    if (booking.status === 'COMPLETED' || booking.status === 'CHECKED_OUT') {
      return NextResponse.json(
        { error: 'Cannot cancel completed booking' },
        { status: 400 }
      );
    }

    // Check cancellation policy if guest is cancelling
    if (isGuest && booking.status === 'CONFIRMED') {
      const now = new Date();
      const startDate = new Date(booking.startDate);
      const daysUntilCheckIn = Math.ceil((startDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      
      // Apply cancellation policy
      let allowedRefund = 0;
      const policy = cancellationPolicy || booking.property.cancellationPolicy || 'STRICT';
      
      switch (policy) {
        case 'FLEXIBLE':
          if (daysUntilCheckIn > 1) {
            allowedRefund = booking.totalAmount;
          } else if (daysUntilCheckIn === 1) {
            allowedRefund = booking.totalAmount * 0.5; // 50% refund
          }
          break;
        case 'MODERATE':
          if (daysUntilCheckIn > 5) {
            allowedRefund = booking.totalAmount;
          } else if (daysUntilCheckIn > 1) {
            allowedRefund = booking.totalAmount * 0.5;
          }
          break;
        case 'STRICT':
        case 'SUPER_STRICT':
        default:
          if (daysUntilCheckIn > 7) {
            allowedRefund = booking.totalAmount * 0.5;
          }
          break;
      }
      
      // Validate refund amount if provided
      if (refundAmount && refundAmount > allowedRefund) {
        return NextResponse.json(
          { 
            error: `Refund amount exceeds allowed amount based on cancellation policy. Maximum refund: $${allowedRefund.toFixed(2)}`,
            maxRefund: allowedRefund,
            policy,
            daysUntilCheckIn,
          },
          { status: 400 }
        );
      }
    }

    // Process refund if applicable
    let refundProcessed = false;
    if (refundAmount && refundAmount > 0 && booking.payments.length > 0) {
      const latestPayment = booking.payments[0];
      
      // Create refund record
      await prisma.payment.create({
        data: {
          bookingId: booking.id,
          paymentNumber: `REF-${Date.now()}`,
          amount: -refundAmount, // Negative amount for refund
          currency: booking.currency || 'USD',
          status: 'REFUNDED',
          paymentMethod: latestPayment.paymentMethod,
          gateway: latestPayment.gateway || 'STRIPE',
          gatewayTransactionId: `${latestPayment.gatewayPaymentId}-REFUND`,
          refundId: `REFUND-${Date.now()}`,
          processedAt: new Date(),
          refundedAt: new Date(),
        },
      });
      
      refundProcessed = true;
    }

    // Update booking status
    const updatedBooking = await prisma.booking.update({
      where: { id },
      data: {
        status: 'CANCELLED',
        cancellationReason: reason,
        cancelledAt: new Date(),
        paymentStatus: refundProcessed ? 'REFUNDED' : 'CANCELLED',
      },
    });

    // Update property availability (release blocked dates)
    await prisma.availability.updateMany({
      where: {
        propertyId: booking.propertyId,
        blockedBy: booking.id,
      },
      data: {
        available: true,
        blockedBy: null,
      },
    });

    // Log the cancellation
    await prisma.auditLog.create({
      data: {
        userId,
        action: 'CANCEL',
        entityType: 'BOOKING',
        entityId: id,
        oldData: JSON.stringify({
          status: booking.status,
          totalAmount: booking.totalAmount,
        }),
        newData: JSON.stringify({
          status: 'CANCELLED',
          cancellationReason: reason,
          refundAmount,
          refundProcessed,
        }),
        ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown',
      },
    });

    // Send notifications (in production)
    console.log(`Booking ${id} cancelled by user ${userId}`);
    console.log(`Reason: ${reason}`);
    if (refundProcessed) {
      console.log(`Refund processed: $${refundAmount}`);
    }

    return NextResponse.json({
      success: true,
      message: 'Booking cancelled successfully',
      data: {
        booking: updatedBooking,
        refundProcessed,
        refundAmount: refundAmount || 0,
        notifyGuest,
        nextSteps: refundProcessed ? [
          'Refund has been processed',
          'Send cancellation confirmation to guest',
          'Update property calendar',
        ] : [
          'Send cancellation confirmation to guest',
          'Update property calendar',
        ],
      },
    });

  } catch (error: any) {
    console.error('Booking cancellation error:', error);
    
    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to cancel booking' },
      { status: 500 }
    );
  }
}
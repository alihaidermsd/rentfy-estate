import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { authOptions } from '@/lib/auth';

// GET /api/bookings/[id] - Get booking details
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;

    if (!userId || !session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const booking = await prisma.booking.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            image: true,
          },
        },
        property: {
          select: {
            id: true,
            title: true,
            description: true,
            images: true,
            address: true,
            city: true,
            state: true,
            country: true,
            latitude: true,
            longitude: true,
            type: true,
            category: true,
            price: true,
            rentPrice: true,
            area: true,
            bedrooms: true,
            bathrooms: true,
            amenities: true,
            checkInTime: true,
            checkOutTime: true,
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                phone: true,
              },
            },
            agent: {
              select: {
                id: true,
                user: {
                  select: {
                    name: true,
                    email: true,
                    phone: true,
                  },
                },
                company: true,
                licenseNumber: true,
              },
            },
          },
        },
        payments: {
          orderBy: { createdAt: 'desc' },
        },
        review: true,
      },
    });

    if (!booking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      );
    }

    // Check permissions
    const isOwner = booking.userId === userId;
    const isPropertyOwner = booking.property.user.id === userId;
    const isAgent = booking.property.agent?.id === userId;
    const isAdmin = session.user.role === 'ADMIN';

    if (!isOwner && !isPropertyOwner && !isAgent && !isAdmin) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }

    // Parse property images
    const processedBooking = {
      ...booking,
      property: {
        ...booking.property,
        images: booking.property.images ? booking.property.images.split(',').filter(Boolean) : [],
        amenities: booking.property.amenities ? booking.property.amenities.split(',').filter(Boolean) : [],
      },
      statusInfo: getBookingStatusInfo(booking.status),
      paymentInfo: booking.payments[0] || null,
      canCancel: canCancelBooking(booking),
      canModify: canModifyBooking(booking),
      timeline: generateBookingTimeline(booking),
    };

    return NextResponse.json({
      success: true,
      data: processedBooking,
    });

  } catch (error) {
    console.error('Booking fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch booking details' },
      { status: 500 }
    );
  }
}

// PUT /api/bookings/[id] - Update booking
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;

    if (!userId || !session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const booking = await prisma.booking.findUnique({
      where: { id },
      select: {
        id: true,
        userId: true,
        propertyId: true,
        status: true,
        startDate: true,
        endDate: true,
        property: {
          select: {
            userId: true,
            agentId: true,
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
    const canUpdate = canUserUpdateBooking(booking, userId, session.user.role!);
    if (!canUpdate) {
      return NextResponse.json(
        { error: 'You do not have permission to update this booking' },
        { status: 403 }
      );
    }

    const body = await request.json();
    
    // Validate update data
    const updateSchema = z.object({
      guests: z.number().int().min(1).optional(),
      guestName: z.string().min(1).optional(),
      guestEmail: z.string().email().optional(),
      guestPhone: z.string().optional(),
      guestAddress: z.string().optional(),
      specialRequests: z.string().optional(),
      checkInTime: z.string().optional(),
      checkOutTime: z.string().optional(),
    });

    const validation = updateSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { 
          error: 'Invalid update data', 
          details: validation.error.issues 
        },
        { status: 400 }
      );
    }

    // Update booking
    const updatedBooking = await prisma.booking.update({
      where: { id },
      data: validation.data,
      include: {
        property: {
          select: {
            title: true,
          },
        },
      },
    });

    // Log the update
    await prisma.auditLog.create({
      data: {
        userId,
        action: 'UPDATE',
        entityType: 'BOOKING',
        entityId: id,
        oldData: JSON.stringify(booking),
        newData: JSON.stringify(updatedBooking),
        ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown',
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Booking updated successfully',
      data: updatedBooking,
    });

  } catch (error: any) {
    console.error('Booking update error:', error);
    
    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to update booking' },
      { status: 500 }
    );
  }
}

// DELETE /api/bookings/[id] - Delete booking (admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const session = await getServerSession(authOptions);

    if (session?.user?.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    const booking = await prisma.booking.findUnique({
      where: { id },
      include: {
        payments: true,
        review: true,
      },
    });

    if (!booking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      );
    }

    // Check if booking can be deleted
    if (booking.status === 'CHECKED_IN' || booking.status === 'CONFIRMED') {
      return NextResponse.json(
        { error: 'Cannot delete active or confirmed booking' },
        { status: 400 }
      );
    }

    // Delete associated data
    await prisma.$transaction(async (prisma) => {
      // Delete payments
      await prisma.payment.deleteMany({
        where: { bookingId: id },
      });
      
      // Delete review if exists
      if (booking.review) {
        await prisma.review.delete({
          where: { id: booking.review.id },
        });
      }
      
      // Delete booking
      await prisma.booking.delete({
        where: { id },
      });
    });

    // Log the deletion
    await prisma.auditLog.create({
      data: {
        userId: session.user.id!,
        action: 'DELETE',
        entityType: 'BOOKING',
        entityId: id,
        oldData: JSON.stringify(booking),
        ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown',
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Booking deleted successfully',
    });

  } catch (error: any) {
    console.error('Booking delete error:', error);
    
    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to delete booking' },
      { status: 500 }
    );
  }
}

// Helper functions
function canUserUpdateBooking(booking: any, userId: string, role: string): boolean {
  if (role === 'ADMIN') return true;
  if (booking.userId === userId) return true;
  if (booking.property.userId === userId) return true;
  if (booking.property.agentId === userId) return true;
  
  return false;
}

function canCancelBooking(booking: any): boolean {
  const now = new Date();
  const startDate = new Date(booking.startDate);
  
  // Can cancel if booking is PENDING or CONFIRMED
  // and start date is at least 24 hours away
  if (['PENDING', 'CONFIRMED'].includes(booking.status)) {
    const hoursDiff = (startDate.getTime() - now.getTime()) / (1000 * 60 * 60);
    return hoursDiff >= 24;
  }
  
  return false;
}

function canModifyBooking(booking: any): boolean {
  const now = new Date();
  const startDate = new Date(booking.startDate);
  
  // Can modify if booking is PENDING or CONFIRMED
  // and start date is at least 48 hours away
  if (['PENDING', 'CONFIRMED'].includes(booking.status)) {
    const hoursDiff = (startDate.getTime() - now.getTime()) / (1000 * 60 * 60);
    return hoursDiff >= 48;
  }
  
  return false;
}

function generateBookingTimeline(booking: any) {
  const timeline = [
    {
      event: 'Booking Created',
      date: booking.createdAt,
      description: 'Booking request submitted',
      icon: '📝',
    },
  ];

  if (booking.confirmedAt) {
    timeline.push({
      event: 'Booking Confirmed',
      date: booking.confirmedAt,
      description: 'Host confirmed the booking',
      icon: '✅',
    });
  }

  if (booking.status === 'CHECKED_IN' && booking.checkInAt) {
    timeline.push({
      event: 'Checked In',
      date: booking.checkInAt,
      description: 'Guest has checked in',
      icon: '🏠',
    });
  }

  if (booking.status === 'CHECKED_OUT' && booking.checkOutAt) {
    timeline.push({
      event: 'Checked Out',
      date: booking.checkOutAt,
      description: 'Guest has checked out',
      icon: '🚪',
    });
  }

  if (booking.status === 'CANCELLED' && booking.cancelledAt) {
    timeline.push({
      event: 'Cancelled',
      date: booking.cancelledAt,
      description: `Booking was cancelled: ${booking.cancellationReason || 'No reason provided'}`,
      icon: '❌',
    });
  }

  if (booking.status === 'COMPLETED') {
    timeline.push({
      event: 'Completed',
      date: booking.updatedAt,
      description: 'Booking completed successfully',
      icon: '🏁',
    });
  }

  return timeline.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
}

function getBookingStatusInfo(status: string) {
  const statusMap: Record<string, any> = {
    PENDING: {
      label: 'Pending',
      color: 'warning',
      description: 'Waiting for host confirmation',
      icon: '⏳',
    },
    CONFIRMED: {
      label: 'Confirmed',
      color: 'success',
      description: 'Booking confirmed',
      icon: '✅',
    },
    CANCELLED: {
      label: 'Cancelled',
      color: 'error',
      description: 'Booking cancelled',
      icon: '❌',
    },
    COMPLETED: {
      label: 'Completed',
      color: 'info',
      description: 'Booking completed',
      icon: '🏁',
    },
    CHECKED_IN: {
      label: 'Checked In',
      color: 'success',
      description: 'Guest has checked in',
      icon: '🏠',
    },
    CHECKED_OUT: {
      label: 'Checked Out',
      color: 'info',
      description: 'Guest has checked out',
      icon: '🚪',
    },
  };

  return statusMap[status] || {
    label: status,
    color: 'default',
    description: 'Unknown status',
    icon: '❓',
  };
}
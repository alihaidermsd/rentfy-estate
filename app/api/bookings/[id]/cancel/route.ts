import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { cancellationReason } = body

    const booking = await prisma.booking.findUnique({
      where: { id: params.id }
    })

    if (!booking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      )
    }

    if (booking.status === 'CANCELLED') {
      return NextResponse.json(
        { error: 'Booking is already cancelled' },
        { status: 400 }
      )
    }

    if (booking.status === 'COMPLETED') {
      return NextResponse.json(
        { error: 'Cannot cancel a completed booking' },
        { status: 400 }
      )
    }

    const updatedBooking = await prisma.booking.update({
      where: { id: params.id },
      data: {
        status: 'CANCELLED',
        specialRequests: cancellationReason 
          ? `${booking.specialRequests || ''}\n\nCancellation Reason: ${cancellationReason}`.trim()
          : booking.specialRequests,
        updatedAt: new Date()
      },
      include: {
        property: {
          select: {
            title: true,
            images: true
          }
        },
        user: {
          select: {
            name: true,
            email: true
          }
        }
      }
    })

    const bookingWithParsedImages = {
      ...updatedBooking,
      property: {
        ...updatedBooking.property,
        images: JSON.parse(updatedBooking.property.images || '[]')
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Booking cancelled successfully',
      data: bookingWithParsedImages
    })
  } catch (error) {
    console.error('Booking cancellation error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
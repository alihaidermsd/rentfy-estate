import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const booking = await prisma.booking.findUnique({
      where: { id: params.id }
    })

    if (!booking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      )
    }

    if (booking.status === 'CONFIRMED') {
      return NextResponse.json(
        { error: 'Booking is already confirmed' },
        { status: 400 }
      )
    }

    if (booking.status === 'CANCELLED') {
      return NextResponse.json(
        { error: 'Cannot confirm a cancelled booking' },
        { status: 400 }
      )
    }

    const updatedBooking = await prisma.booking.update({
      where: { id: params.id },
      data: {
        status: 'CONFIRMED',
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
      message: 'Booking confirmed successfully',
      data: bookingWithParsedImages
    })
  } catch (error) {
    console.error('Booking confirmation error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const booking = await prisma.booking.findUnique({
      where: { id: params.id },
      include: {
        property: {
          select: {
            id: true,
            title: true,
            type: true,
            category: true,
            images: true,
            address: true,
            city: true,
            state: true,
            country: true,
            price: true,
            rentPrice: true,
            user: {
              select: {
                name: true,
                email: true,
                phone: true
              }
            }
          }
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true
          }
        },
        payments: {
          orderBy: { createdAt: 'desc' }
        }
      }
    })

    if (!booking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      )
    }

    const bookingWithParsedImages = {
      ...booking,
      property: {
        ...booking.property,
        images: JSON.parse(booking.property.images || '[]')
      }
    }

    return NextResponse.json({
      success: true,
      data: bookingWithParsedImages
    })
  } catch (error) {
    console.error('Booking fetch error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    
    const booking = await prisma.booking.update({
      where: { id: params.id },
      data: {
        ...body,
        startDate: body.startDate ? new Date(body.startDate) : undefined,
        endDate: body.endDate ? new Date(body.endDate) : undefined,
        totalAmount: body.totalAmount ? parseFloat(body.totalAmount) : undefined,
        cleaningFee: body.cleaningFee ? parseFloat(body.cleaningFee) : undefined,
        serviceFee: body.serviceFee ? parseFloat(body.serviceFee) : undefined,
        taxAmount: body.taxAmount ? parseFloat(body.taxAmount) : undefined,
        guests: body.guests ? parseInt(body.guests) : undefined,
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
      ...booking,
      property: {
        ...booking.property,
        images: JSON.parse(booking.property.images || '[]')
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Booking updated successfully',
      data: bookingWithParsedImages
    })
  } catch (error) {
    console.error('Booking update error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.booking.delete({
      where: { id: params.id }
    })

    return NextResponse.json({
      success: true,
      message: 'Booking deleted successfully'
    })
  } catch (error) {
    console.error('Booking deletion error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
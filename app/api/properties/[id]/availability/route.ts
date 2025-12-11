import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { searchParams } = new URL(request.url)
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    if (!startDate || !endDate) {
      return NextResponse.json(
        { error: 'startDate and endDate are required' },
        { status: 400 }
      )
    }

    const start = new Date(startDate)
    const end = new Date(endDate)

    // Check for existing bookings in the date range
    const existingBookings = await prisma.booking.findMany({
      where: {
        propertyId: params.id,
        OR: [
          {
            startDate: { lte: end },
            endDate: { gte: start }
          }
        ],
        status: { in: ['PENDING', 'CONFIRMED'] }
      }
    })

    // Check property availabilities
    const availabilities = await prisma.availability.findMany({
      where: {
        propertyId: params.id,
        date: {
          gte: start,
          lte: end
        }
      }
    })

    const isAvailable = existingBookings.length === 0

    return NextResponse.json({
      success: true,
      data: {
        isAvailable,
        existingBookings,
        availabilities,
        message: isAvailable ? 'Property is available for the selected dates' : 'Property is not available for the selected dates'
      }
    })
  } catch (error) {
    console.error('Availability check error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { date, available, price } = body

    if (!date) {
      return NextResponse.json(
        { error: 'Date is required' },
        { status: 400 }
      )
    }

    const availability = await prisma.availability.upsert({
      where: {
        propertyId_date: {
          propertyId: params.id,
          date: new Date(date)
        }
      },
      update: {
        available: available !== undefined ? available : true,
        price: price ? parseFloat(price) : null
      },
      create: {
        propertyId: params.id,
        date: new Date(date),
        available: available !== undefined ? available : true,
        price: price ? parseFloat(price) : null
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Availability updated successfully',
      data: availability
    })
  } catch (error) {
    console.error('Availability update error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { propertyId, startDate, endDate } = body

    // Validation
    if (!propertyId || !startDate || !endDate) {
      return NextResponse.json(
        { error: 'propertyId, startDate, and endDate are required' },
        { status: 400 }
      )
    }

    const start = new Date(startDate)
    const end = new Date(endDate)

    // Check if end date is after start date
    if (end <= start) {
      return NextResponse.json(
        { error: 'End date must be after start date' },
        { status: 400 }
      )
    }

    // Check property exists and is published
    const property = await prisma.property.findUnique({
      where: { 
        id: propertyId,
        status: 'PUBLISHED'
      }
    })

    if (!property) {
      return NextResponse.json(
        { error: 'Property not found or not available' },
        { status: 404 }
      )
    }

    // Check for existing bookings that conflict with the requested dates
    const conflictingBookings = await prisma.booking.findMany({
      where: {
        propertyId,
        OR: [
          {
            startDate: { lte: end },
            endDate: { gte: start }
          }
        ],
        status: { in: ['PENDING', 'CONFIRMED'] }
      }
    })

    // Check property-specific availability rules
    const availabilities = await prisma.availability.findMany({
      where: {
        propertyId,
        date: {
          gte: start,
          lte: end
        },
        available: false
      }
    })

    const isAvailable = conflictingBookings.length === 0 && availabilities.length === 0

    // Calculate total days and price
    const totalDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
    const basePrice = property.rentPrice || property.price || 0
    const totalAmount = basePrice * totalDays

    // Check minimum stay requirement
    const meetsMinStay = !property.minStay || totalDays >= property.minStay
    const meetsMaxStay = !property.maxStay || totalDays <= property.maxStay

    return NextResponse.json({
      success: true,
      data: {
        isAvailable,
        property: {
          id: property.id,
          title: property.title,
          basePrice,
          minStay: property.minStay,
          maxStay: property.maxStay,
          instantBook: property.instantBook
        },
        checkIn: {
          startDate: start,
          endDate: end,
          totalDays,
          totalAmount,
          meetsMinStay,
          meetsMaxStay
        },
        conflicts: {
          existingBookings: conflictingBookings.length,
          blockedDates: availabilities.length,
          details: {
            conflictingBookings,
            blockedDates: availabilities
          }
        },
        message: isAvailable && meetsMinStay && meetsMaxStay 
          ? 'Property is available for the selected dates'
          : !isAvailable 
            ? 'Property is not available for the selected dates'
            : !meetsMinStay
              ? `Minimum stay requirement not met (${property.minStay} days required)`
              : `Maximum stay exceeded (${property.maxStay} days maximum)`
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
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const propertyId = searchParams.get('propertyId')
    const status = searchParams.get('status')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')

    const skip = (page - 1) * limit
    
    const where: any = {}
    if (userId) where.userId = userId
    if (propertyId) where.propertyId = propertyId
    if (status) where.status = status

    const [bookings, total] = await Promise.all([
      prisma.booking.findMany({
        where,
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
              user: {
                select: {
                  name: true,
                  phone: true,
                  email: true
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
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      prisma.booking.count({ where })
    ])

    const bookingsWithParsedImages = bookings.map(booking => ({
      ...booking,
      property: {
        ...booking.property,
        images: JSON.parse(booking.property.images || '[]')
      }
    }))

    return NextResponse.json({
      success: true,
      data: bookingsWithParsedImages,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Bookings fetch error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    // Get authenticated user
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json()
    const {
      propertyId, startDate, endDate, guests, guestName, guestEmail,
      guestPhone, specialRequests, totalAmount, cleaningFee, serviceFee, taxAmount
    } = body

    // Use authenticated user's ID
    const userId = session.user.id;

    // Validation
    if (!propertyId || !startDate || !endDate || !guests || !guestName || !guestEmail || !totalAmount) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Check property availability
    const existingBooking = await prisma.booking.findFirst({
      where: {
        propertyId,
        OR: [
          {
            startDate: { lte: new Date(endDate) },
            endDate: { gte: new Date(startDate) }
          }
        ],
        status: { in: ['PENDING', 'CONFIRMED'] }
      }
    })

    if (existingBooking) {
      return NextResponse.json(
        { error: 'Property not available for the selected dates' },
        { status: 400 }
      )
    }

    // Calculate total days
    const start = new Date(startDate)
    const end = new Date(endDate)
    const totalDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))

    const booking = await prisma.booking.create({
      data: {
        bookingNumber: Date.now().toString(36) + Math.random().toString(36).substring(2), // Generated unique booking number
        property: { connect: { id: propertyId } }, // Connect to existing property
        user: { connect: { id: userId } },       // Connect to existing user
        startDate: start,
        endDate: end,
        totalDays,
        totalAmount: parseFloat(totalAmount),
        cleaningFee: cleaningFee ? parseFloat(cleaningFee) : null,
        serviceFee: serviceFee ? parseFloat(serviceFee) : null,
        taxAmount: taxAmount ? parseFloat(taxAmount) : null,
        guests: parseInt(guests),
        guestName,
        guestEmail,
        guestPhone: guestPhone || null,
        specialRequests: specialRequests || null,
        status: 'PENDING',
        paymentStatus: 'PENDING'
      },
      include: {
        property: {
          select: {
            title: true,
            images: true,
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
            name: true,
            email: true,
            phone: true
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

    return NextResponse.json(
      { 
        success: true,
        message: 'Booking created successfully',
        data: bookingWithParsedImages 
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Booking creation error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
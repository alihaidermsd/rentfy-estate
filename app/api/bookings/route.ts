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
    // Development: allow booking creation without auth/validation/availability checks
    const body = await request.json();
    const {
      propertyId, startDate, endDate, guests = 1, guestName = 'Guest', guestEmail = 'guest@example.com',
      guestPhone, specialRequests, totalAmount = 0, cleaningFee, serviceFee, taxAmount, userId: providedUserId
    } = body || {};

    // Determine userId: prefer provided, otherwise attach to first user
    let userId = providedUserId;
    if (!userId) {
      const firstUser = await prisma.user.findFirst();
      userId = firstUser?.id as string | undefined;
    }

    const start = startDate ? new Date(startDate) : new Date();
    const end = endDate ? new Date(endDate) : new Date(start.getTime() + 24 * 60 * 60 * 1000);
    const totalDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));

    const bookingData: any = {
      bookingNumber: Date.now().toString(36) + Math.random().toString(36).substring(2),
      startDate: start,
      endDate: end,
      totalDays,
      totalAmount: Number(totalAmount),
      cleaningFee: cleaningFee ? Number(cleaningFee) : null,
      serviceFee: serviceFee ? Number(serviceFee) : null,
      taxAmount: taxAmount ? Number(taxAmount) : null,
      guests: Number(guests),
      guestName,
      guestEmail,
      guestPhone: guestPhone || null,
      specialRequests: specialRequests || null,
      status: 'PENDING',
      paymentStatus: 'PENDING'
    };

    if (propertyId) bookingData.property = { connect: { id: propertyId } };
    if (userId) bookingData.user = { connect: { id: userId } };

    const booking = await prisma.booking.create({ data: bookingData as any });

    return NextResponse.json({ success: true, message: 'Booking created (dev)', data: booking }, { status: 201 });
  } catch (error) {
    console.error('Booking creation error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
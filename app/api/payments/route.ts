import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import cuid from 'cuid'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const status = searchParams.get('status')
    const bookingId = searchParams.get('bookingId')
    const paymentMethod = searchParams.get('paymentMethod')

    const skip = (page - 1) * limit
    
    const where: any = {}
    if (status) where.status = status
    if (bookingId) where.bookingId = bookingId
    if (paymentMethod) where.paymentMethod = paymentMethod

    const [payments, total] = await Promise.all([
      prisma.payment.findMany({
        where,
        include: {
          booking: {
            select: {
              id: true,
              totalAmount: true,
              guestName: true,
              guestEmail: true,
              property: {
                select: {
                  id: true,
                  title: true,
                  images: true
                }
              }
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      prisma.payment.count({ where })
    ])

    const paymentsWithParsedImages = payments.map(payment => ({
      ...payment,
      booking: {
        ...payment.booking,
        property: {
          ...payment.booking.property,
          images: JSON.parse(payment.booking.property.images || '[]')
        }
      }
    }))

    return NextResponse.json({
      success: true,
      data: paymentsWithParsedImages,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Payments fetch error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      bookingId,
      amount,
      currency = 'USD',
      paymentMethod,
      stripePaymentIntentId
    } = body

    // Validation
    if (!bookingId || !amount || !paymentMethod) {
      return NextResponse.json(
        { error: 'bookingId, amount, and paymentMethod are required' },
        { status: 400 }
      )
    }

    // Check if booking exists
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      select: {
        id: true,
        totalAmount: true,
        status: true,
        paymentStatus: true
      }
    })

    if (!booking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      )
    }

    // Check if booking is already paid
    if (booking.paymentStatus === 'PAID') {
      return NextResponse.json(
        { error: 'Booking is already paid' },
        { status: 400 }
      )
    }

    // Validate amount matches booking total
    if (parseFloat(amount) !== booking.totalAmount) {
      return NextResponse.json(
        { error: 'Payment amount does not match booking total' },
        { status: 400 }
      )
    }

    // Create payment record
    const paymentNumber = cuid()

    const payment = await prisma.payment.create({
      data: {
        bookingId,
        paymentNumber,
        amount: parseFloat(amount),
        currency,
        paymentMethod,
        gatewayPaymentId: stripePaymentIntentId || null,
        status: 'PENDING' // Will be updated by webhook
      },
      include: {
        booking: {
          select: {
            id: true,
            totalAmount: true,
            guestName: true,
            guestEmail: true,
            property: {
              select: {
                title: true
              }
            }
          }
        }
      }
    })

    // In a real implementation, you would integrate with Stripe/PayPal here
    // For now, we'll simulate payment processing
    const paymentResponse = {
      id: payment.id,
      amount: payment.amount,
      currency: payment.currency,
      status: payment.status,
      paymentMethod: payment.paymentMethod,
      bookingId: payment.bookingId,
      createdAt: payment.createdAt,
      // Simulated payment gateway response
      gatewayResponse: {
        paymentIntentId: stripePaymentIntentId || `pi_${Date.now()}`,
        clientSecret: `cs_test_${Date.now()}`,
        requiresAction: false
      }
    }

    return NextResponse.json(
      { 
        success: true,
        message: 'Payment initiated successfully',
        data: paymentResponse 
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Payment creation error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
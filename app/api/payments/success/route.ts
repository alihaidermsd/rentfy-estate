import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const paymentIntentId = searchParams.get('payment_intent')
    const bookingId = searchParams.get('bookingId')

    if (!paymentIntentId && !bookingId) {
      return NextResponse.json(
        { error: 'payment_intent or bookingId parameter is required' },
        { status: 400 }
      )
    }

    let payment;

    if (paymentIntentId) {
      // Find payment by Stripe payment intent ID
      payment = await prisma.payment.findFirst({
        where: { gatewayPaymentId: paymentIntentId },
        include: {
          booking: {
            include: {
              property: {
                select: {
                  id: true,
                  title: true,
                  images: true,
                  address: true,
                  city: true,
                  state: true
                }
              },
              user: {
                select: {
                  name: true,
                  email: true
                }
              }
            }
          }
        }
      })
    } else if (bookingId) {
      // Find latest payment for booking
      payment = await prisma.payment.findFirst({
        where: { bookingId },
        include: {
          booking: {
            include: {
              property: {
                select: {
                  id: true,
                  title: true,
                  images: true,
                  address: true,
                  city: true,
                  state: true
                }
              },
              user: {
                select: {
                  name: true,
                  email: true
                }
              }
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      })
    }

    if (!payment) {
      return NextResponse.json(
        { error: 'Payment not found' },
        { status: 404 }
      )
    }

    const paymentWithParsedImages = {
      ...payment,
      booking: {
        ...payment.booking,
        property: {
          ...payment.booking.property,
          images: JSON.parse(payment.booking.property.images || '[]')
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Payment completed successfully',
      data: {
        payment: paymentWithParsedImages,
        nextSteps: [
          'Your booking has been confirmed',
          'You will receive a confirmation email shortly',
          'Contact the property owner if you have any questions',
          'Review your booking details in your account'
        ]
      }
    })
  } catch (error) {
    console.error('Payment success fetch error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { paymentId, bookingId } = body

    if (!paymentId && !bookingId) {
      return NextResponse.json(
        { error: 'paymentId or bookingId is required' },
        { status: 400 }
      )
    }

    let payment;

    if (paymentId) {
      // Manually mark payment as completed (for testing/demo purposes)
      payment = await prisma.payment.update({
        where: { id: paymentId },
        data: {
          status: 'COMPLETED',
          updatedAt: new Date()
        },
        include: {
          booking: {
            include: {
              property: {
                select: {
                  title: true,
                  images: true
                }
              }
            }
          }
        }
      })

      // Also update booking payment status
      await prisma.booking.update({
        where: { id: payment.bookingId },
        data: {
          paymentStatus: 'PAID',
          paymentId: payment.id,
          updatedAt: new Date()
        }
      })
    } else if (bookingId) {
      // Find and complete the latest pending payment for this booking
      payment = await prisma.payment.findFirst({
        where: {
          bookingId,
          status: 'PENDING'
        },
        orderBy: { createdAt: 'desc' }
      })

      if (payment) {
        await prisma.payment.update({
          where: { id: payment.id },
          data: {
            status: 'COMPLETED',
            updatedAt: new Date()
          }
        })

        await prisma.booking.update({
          where: { id: bookingId },
          data: {
            paymentStatus: 'PAID',
            paymentId: payment.id,
            updatedAt: new Date()
          }
        })
      }
    }

    if (!payment) {
      return NextResponse.json(
        { error: 'Payment not found or already completed' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Payment marked as completed successfully',
      data: payment
    })
  } catch (error) {
    console.error('Payment completion error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
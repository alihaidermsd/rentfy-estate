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
      payment = await prisma.payment.findFirst({
        where: { gatewayPaymentId: paymentIntentId },
        include: {
          booking: {
            select: {
              id: true,
              totalAmount: true,
              guestName: true,
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
    } else if (bookingId) {
      payment = await prisma.payment.findFirst({
        where: { bookingId },
        include: {
          booking: {
            select: {
              id: true,
              totalAmount: true,
              guestName: true,
              property: {
                select: {
                  title: true,
                  images: true
                }
              }
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      })
    }

    const responseData = {
      message: 'Payment was cancelled',
      instructions: [
        'Your payment process was cancelled',
        'No charges were made to your account',
        'You can restart the payment process from your bookings page',
        'If you need assistance, please contact support'
      ]
    }

    if (payment) {
      Object.assign(responseData, {
        payment: {
          id: payment.id,
          amount: payment.amount,
          status: payment.status,
          bookingId: payment.bookingId
        }
      })
    }

    return NextResponse.json({
      success: true,
      data: responseData
    })
  } catch (error) {
    console.error('Payment cancel fetch error:', error)
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
      payment = await prisma.payment.update({
        where: { id: paymentId },
        data: {
          status: 'CANCELLED',
          updatedAt: new Date()
        }
      })
    } else if (bookingId) {
      // Cancel all pending payments for this booking
      await prisma.payment.updateMany({
        where: {
          bookingId,
          status: 'PENDING'
        },
        data: {
          status: 'CANCELLED',
          updatedAt: new Date()
        }
      })

      payment = await prisma.payment.findFirst({
        where: { bookingId },
        orderBy: { createdAt: 'desc' }
      })
    }

    return NextResponse.json({
      success: true,
      message: 'Payment cancelled successfully',
      data: payment
    })
  } catch (error) {
    console.error('Payment cancellation error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
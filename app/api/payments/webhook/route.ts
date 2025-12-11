import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    // In production, verify webhook signature from Stripe/PayPal
    const body = await request.text()
    const signature = request.headers.get('stripe-signature')
    
    let event;
    
    try {
      // In production, verify webhook signature
      // event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET);
      
      // For now, parse the body directly
      event = JSON.parse(body);
    } catch (err) {
      console.error('Webhook signature verification failed:', err);
      return NextResponse.json(
        { error: 'Webhook signature verification failed' },
        { status: 400 }
      );
    }

    // Handle different event types
    switch (event.type) {
      case 'payment_intent.succeeded':
        await handlePaymentSuccess(event.data.object);
        break;
      
      case 'payment_intent.payment_failed':
        await handlePaymentFailure(event.data.object);
        break;
      
      case 'payment_intent.canceled':
        await handlePaymentCancel(event.data.object);
        break;
      
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}

async function handlePaymentSuccess(paymentIntent: any) {
  try {
    const { id: stripePaymentIntentId, amount, currency } = paymentIntent;
    
    // Find payment by Stripe payment intent ID
    const payment = await prisma.payment.findFirst({
      where: { gatewayPaymentId: stripePaymentIntentId },
      include: { booking: true }
    });

    if (!payment) {
      console.error('Payment not found for Stripe payment intent:', stripePaymentIntentId);
      return;
    }

    // Update payment status
    await prisma.payment.update({
      where: { id: payment.id },
      data: { 
        status: 'COMPLETED',
        updatedAt: new Date()
      }
    });

    // Update booking payment status
    await prisma.booking.update({
      where: { id: payment.bookingId },
      data: { 
        paymentStatus: 'PAID',
        paymentId: payment.id,
        updatedAt: new Date()
      }
    });

    console.log(`Payment ${payment.id} completed successfully`);
  } catch (error) {
    console.error('Error handling payment success:', error);
  }
}

async function handlePaymentFailure(paymentIntent: any) {
  try {
    const { id: stripePaymentIntentId, last_payment_error } = paymentIntent;
    
    const payment = await prisma.payment.findFirst({
      where: { gatewayPaymentId: stripePaymentIntentId }
    });

    if (!payment) {
      console.error('Payment not found for Stripe payment intent:', stripePaymentIntentId);
      return;
    }

    await prisma.payment.update({
      where: { id: payment.id },
      data: { 
        status: 'FAILED',
        updatedAt: new Date()
      }
    });

    console.log(`Payment ${payment.id} failed:`, last_payment_error?.message);
  } catch (error) {
    console.error('Error handling payment failure:', error);
  }
}

async function handlePaymentCancel(paymentIntent: any) {
  try {
    const { id: stripePaymentIntentId } = paymentIntent;
    
    const payment = await prisma.payment.findFirst({
      where: { gatewayPaymentId: stripePaymentIntentId }
    });

    if (!payment) {
      console.error('Payment not found for Stripe payment intent:', stripePaymentIntentId);
      return;
    }

    await prisma.payment.update({
      where: { id: payment.id },
      data: { 
        status: 'CANCELLED',
        updatedAt: new Date()
      }
    });

    console.log(`Payment ${payment.id} was cancelled`);
  } catch (error) {
    console.error('Error handling payment cancellation:', error);
  }
}
import { NextRequest } from 'next/server';
import Stripe from 'stripe';
import connectDB from '@/lib/db';
import Order from '@/models/Order';
import { apiResponse, apiError } from '@/lib/api-helpers';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-04-10',
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.text();
    const sig = req.headers.get('stripe-signature')!;

    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
    } catch (err: any) {
      return apiError(`Webhook Error: ${err.message}`, 400);
    }

    await connectDB();

    if (event.type === 'payment_intent.succeeded') {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      const orderId = paymentIntent.metadata.orderId;

      if (orderId) {
        await Order.findByIdAndUpdate(orderId, {
          paymentStatus: 'paid',
          paymentId: paymentIntent.id,
          status: 'confirmed',
          $push: {
            statusHistory: {
              status: 'confirmed',
              date: new Date(),
              note: 'Payment received via Stripe',
            },
          },
        });
      }
    }

    if (event.type === 'payment_intent.payment_failed') {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      const orderId = paymentIntent.metadata.orderId;

      if (orderId) {
        await Order.findByIdAndUpdate(orderId, {
          paymentStatus: 'failed',
        });
      }
    }

    return apiResponse({ received: true });
  } catch (error: any) {
    return apiError(error.message, 500);
  }
}

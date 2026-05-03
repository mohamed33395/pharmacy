import { NextRequest } from 'next/server';
import Stripe from 'stripe';
import { apiResponse, apiError, requireAuth } from '@/lib/api-helpers';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-04-10',
});

// POST /api/payments/stripe - Create payment intent
export async function POST(req: NextRequest) {
  try {
    await requireAuth();

    const { amount, orderId } = await req.json();

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to halalas (cents)
      currency: 'sar',
      metadata: { orderId },
    });

    return apiResponse({
      clientSecret: paymentIntent.client_secret,
    });
  } catch (error: any) {
    return apiError(error.message, error.status || 500);
  }
}

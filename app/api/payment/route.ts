import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

export const dynamic = 'force-dynamic';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: '2024-06-20', 
});

export async function POST(request: NextRequest) {
  console.log("Received request:", request.method, request.url);
  console.log("Request headers:", request.headers);

  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };

  try {
    const body = await request.json();
    console.log("Request body:", body);
    const { amount } = body;
    console.log("Received amount:", amount);

    if (typeof amount !== 'number' || isNaN(amount)) {
      console.error("Invalid amount:", amount);
      return NextResponse.json({ error: "Invalid amount provided" }, { status: 400, headers: corsHeaders });
    }

    console.log("Creating payment intent with amount:", amount);
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount,
      currency: "eur",
    });
    console.log("Payment Intent created:", paymentIntent);

    return NextResponse.json({ clientSecret: paymentIntent.client_secret }, { headers: corsHeaders });
  } catch (error) {
    console.error("Error creating payment intent:", error);
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500, headers: corsHeaders });
    } else {
      return NextResponse.json({ error: 'An unknown error occurred' }, { status: 500, headers: corsHeaders });
    }
  }
}

export async function OPTIONS(request: NextRequest) {
  return NextResponse.json({}, { headers: corsHeaders });
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};
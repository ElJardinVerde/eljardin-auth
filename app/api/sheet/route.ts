import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

export const dynamic = "force-dynamic";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function POST(request: NextRequest) {
  console.log("Received request:", request.method, request.url);
  console.log("Request headers:", request.headers);

  try {
    const body = await request.json();
    console.log("Request body:", body);
    const { amount } = body;
    console.log("Received amount:", amount);

    if (typeof amount !== "number" || isNaN(amount)) {
      console.error("Invalid amount:", amount);
      return NextResponse.json(
        { error: "Invalid amount provided" },
        { status: 400, headers: corsHeaders }
      );
    }

    console.log("Creating customer");
    const customer = await stripe.customers.create();
    console.log("Customer created:", customer.id);

    console.log("Creating ephemeral key");
    const ephemeralKey = await stripe.ephemeralKeys.create(
      { customer: customer.id },
      { apiVersion: "2024-03-14" }
    );
    console.log("Ephemeral key created");

    console.log("Creating payment intent");
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: "eur",
      customer: customer.id,
      automatic_payment_methods: { enabled: true },
    });
    console.log("Payment intent created:", paymentIntent.id);

    return NextResponse.json(
      {
        paymentIntent: paymentIntent.client_secret,
        ephemeralKey: ephemeralKey.secret,
        customer: customer.id,
      },
      { headers: corsHeaders }
    );
  } catch (error) {
    console.error("Error creating payment sheet:", error);
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500, headers: corsHeaders }
      );
    } else {
      return NextResponse.json(
        { error: "An unknown error occurred" },
        { status: 500, headers: corsHeaders }
      );
    }
  }
}

export async function OPTIONS(request: NextRequest) {
  return NextResponse.json({}, { headers: corsHeaders });
}

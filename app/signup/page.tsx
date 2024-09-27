"use client";
import React from "react";
import { SignUp } from "./SignUp";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from '@stripe/react-stripe-js';


const stripePromise = loadStripe(
  "pk_live_51Ob2fwJPY3RNRZWOedZj2YIynTY1aEIIP3IapfteD0kdIFYiRIbHAtXa6pCr5juKmjhBm63DpAGEOVLHl79BAJ7E00vQLcWUze"
);

const SignUpPage = () => {

  return (
    <div className="min-h-screen flex items-center justify-center bg-white dark:bg-black">
      <Elements stripe={stripePromise}>
        <SignUp />
      </Elements>
    </div>
  );
};

export default SignUpPage;

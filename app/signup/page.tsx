"use client";
import React from "react";
import { SignUp } from "./SignUp";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from '@stripe/react-stripe-js';


const stripePromise = loadStripe(
  "pk_test_51Ob2fwJPY3RNRZWOPMWKBlqBBlmXxAOOmPK8Oc1q8RYGckaOADrxaHPIARD1NGV3h8PaCrnCsQxLwPCWn7hQdYne00MdCsfgG5"
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

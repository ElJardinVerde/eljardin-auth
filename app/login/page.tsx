'use client'
import LoginPage from "../login/LoginPage";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from '@stripe/react-stripe-js';

const stripePromise = loadStripe(
  "pk_test_51Ob2fwJPY3RNRZWOPMWKBlqBBlmXxAOOmPK8Oc1q8RYGckaOADrxaHPIARD1NGV3h8PaCrnCsQxLwPCWn7hQdYne00MdCsfgG5"
);
export default function Login() {
  return (
    <Elements stripe={stripePromise}>
      <LoginPage />
    </Elements>
  );
}

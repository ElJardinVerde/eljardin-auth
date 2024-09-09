'use client'
import LoginPage from "../login/LoginPage";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from '@stripe/react-stripe-js';


export default function Login() {
  return (
      <LoginPage />
  );
}

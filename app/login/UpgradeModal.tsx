import React, { useState, useEffect } from "react";
import { useStripe, useElements, PaymentElement } from "@stripe/react-stripe-js";
import { Elements } from '@stripe/react-stripe-js';
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../api/firebaseConfig";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

interface UpgradeModalProps {
  userData: {
    uid: string;
    email: string;
  };
  showSnackbar: (message: string, type: "success" | "error") => void;
  fetchUserData: (uid: string, email: string) => Promise<void>;
  onClose: () => void;
}

const UpgradeModal: React.FC<UpgradeModalProps> = ({
  userData,
  showSnackbar,
  fetchUserData,
  onClose,
}) => {
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const stripe = useStripe();
  const elements = useElements();

  useEffect(() => {
    const createPaymentIntent = async () => {
      try {
        const response = await fetch("/api/payment", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ amount: 2500 }), // 25 EUR in cents
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        setClientSecret(data.clientSecret);
      } catch (error) {
        console.error("Error creating payment intent:", error);
        showSnackbar("Failed to initialize payment. Please try again.", "error");
      }
    };

    createPaymentIntent();
  }, [showSnackbar]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsProcessing(true);

    if (!stripe || !elements || !clientSecret) {
      showSnackbar("Payment processing is not ready. Please try again.", "error");
      setIsProcessing(false);
      return;
    }

    try {
      const result = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: "https://auth.eljardinverde.org/login",
        },
        redirect: "if_required",
      });

      if (result.error) {
        showSnackbar(result.error.message || "An error occurred during payment.", "error");
      } else if (result.paymentIntent && result.paymentIntent.status === "succeeded") {
        const userRef = doc(db, "users", userData.uid);
        await updateDoc(userRef, {
          membershipType: "VIP Membership",
          membershipUpgradeDate: new Date(),
          membershipExpirationDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
        });

        showSnackbar("Upgrade to VIP successful!", "success");
        await fetchUserData(userData.uid, userData.email);
        onClose();
      }
    } catch (error) {
      console.error("Payment failed", error);
      showSnackbar("Payment failed. Please try again.", "error");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-2xl max-w-md w-full mx-4"
      >
        <h3 className="text-2xl font-bold text-gray-800 dark:text-white text-center mb-6">
          Upgrade to VIP Membership
        </h3>
        {clientSecret ? (
          <form onSubmit={handleSubmit}>
            <PaymentElement options={{ layout: "tabs" }} />
            <div className="mt-6">
              <Button
                type="submit"
                disabled={isProcessing || !stripe || !elements}
                className="w-full"
              >
                {isProcessing ? "Processing..." : "Pay €25 and Upgrade"}
              </Button>
            </div>
          </form>
        ) : (
          <p className="text-center">Loading payment form...</p>
        )}
        <Button onClick={onClose} className="w-full mt-4">
          Cancel
        </Button>
      </motion.div>
    </motion.div>
  );
};

export default UpgradeModal;
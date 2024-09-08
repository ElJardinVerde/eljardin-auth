import React, { useState, useEffect } from "react";
import {
  useStripe,
  useElements,
  PaymentElement,
  Elements,
} from "@stripe/react-stripe-js";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../api/firebaseConfig";
import { Button } from "@/components/ui/button";
import {
  DialogFooter,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { motion, AnimatePresence } from "framer-motion";
import { loadStripe } from "@stripe/stripe-js";

const stripePromise = loadStripe(
    "pk_test_51Ob2fwJPY3RNRZWOPMWKBlqBBlmXxAOOmPK8Oc1q8RYGckaOADrxaHPIARD1NGV3h8PaCrnCsQxLwPCWn7hQdYne00MdCsfgG5"
  );

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
  const [selectedMembership, setSelectedMembership] = useState<string | null>(
    null
  );
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    async function createPaymentIntent() {
      try {
        console.log("Attempting to create payment intent...");
        const response = await fetch("/api/payment", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ amount: 2500 }), 
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(
            `HTTP error! status: ${response.status}, body: ${errorText}`
          );
        }

        const data = await response.json();
        console.log("Response data:", data);

        if (data.clientSecret) {
          setClientSecret(data.clientSecret);
          console.log("Client secret set successfully");
        } else {
          throw new Error("No client secret received from the server");
        }
      } catch (error) {
        console.error("Error creating payment intent:", error);
        showSnackbar(
          "Failed to initialize payment. Please try again.",
          "error"
        );
      }
    }

    createPaymentIntent();
  }, [showSnackbar]);

  const handleMembershipSelection = () => {
    setSelectedMembership("VIP Membership");
  };

  const StripePaymentForm = () => {
    const stripe = useStripe();
    const elements = useElements();

    const handlePaymentSubmission = async (
      event: React.FormEvent<HTMLFormElement>
    ) => {
      event.preventDefault();
      setIsProcessing(true);

      if (!stripe || !elements) {
        console.error("Stripe.js has not loaded yet.");
        showSnackbar("Stripe.js is not loaded. Please try again.", "error");
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
          console.log(result.error.message);
          showSnackbar(
            result.error.message || "An error occurred during payment.",
            "error"
          );
        } else if (
          result.paymentIntent &&
          result.paymentIntent.status === "succeeded"
        ) {
          console.log("Payment succeeded!");
          // Update user's membership in Firestore
          const userRef = doc(db, "users", userData.uid);
          await updateDoc(userRef, {
            membershipType: "VIP Membership",
            membershipUpgradeDate: new Date(),
            membershipExpirationDate: new Date(
              new Date().setFullYear(new Date().getFullYear() + 1)
            ),
          });

          showSnackbar("Upgrade to VIP successful!", "success");
          onClose();

          // Refresh user data
          await fetchUserData(userData.uid, userData.email);
        } else {
          console.error("Unexpected payment result:", result);
          showSnackbar("Unexpected payment result. Please try again.", "error");
        }
      } catch (error) {
        console.error("Payment failed", error);
        showSnackbar("Payment failed. Please try again.", "error");
      } finally {
        setIsProcessing(false);
      }
    };

    return (
      <form
        onSubmit={handlePaymentSubmission}
        className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-md max-w-xl w-full mx-auto"
      >
        <h3 className="text-2xl font-semibold text-gray-800 dark:text-white mb-6 text-center">
          Complete your payment for{" "}
          <span className="text-blue-600 dark:text-blue-400">
            VIP Membership
          </span>
        </h3>
        <div className="mb-6">
          <PaymentElement className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg" />
        </div>
        <button
          type="submit"
          className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-md transition duration-200 ease-in-out mb-4 disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={isProcessing || !stripe || !elements}
        >
          {isProcessing ? "Processing..." : "Submit Payment"}
        </button>
        <button
          onClick={onClose}
          className="w-full py-3 px-4 bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 text-gray-800 dark:text-white font-semibold rounded-lg shadow-md transition duration-200 ease-in-out"
        >
          Cancel
        </button>
      </form>
    );
  };

  return (
    <AnimatePresence>
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
          {!selectedMembership ? (
            <div className="space-y-6">
              <h3 className="text-2xl font-bold text-gray-800 dark:text-white text-center">
                Upgrade to VIP Membership
              </h3>
              <div className="space-y-4">
                <button
                  onClick={handleMembershipSelection}
                  className="w-full py-3 px-4 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg shadow-md transition duration-200 ease-in-out flex items-center justify-between"
                >
                  <span>VIP Membership</span>
                  <span className="bg-purple-500 py-1 px-2 rounded-md text-sm">
                    25 EUR
                  </span>
                </button>
              </div>
              <button
                onClick={onClose}
                className="w-full py-3 px-4 bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 text-gray-800 dark:text-white font-semibold rounded-lg shadow-md transition duration-200 ease-in-out"
              >
                Cancel
              </button>
            </div>
          ) : (
            clientSecret && (
              <Elements stripe={stripePromise} options={{ clientSecret }}>
                <StripePaymentForm />
              </Elements>
            )
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default UpgradeModal;

import React, { useState } from "react";
import {
  useStripe,
  useElements,
  PaymentElement,
} from "@stripe/react-stripe-js";
import { collection, query, where, getDocs, setDoc } from "firebase/firestore";
import { db } from "../api/firebaseConfig";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";

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
  const [isProcessing, setIsProcessing] = useState(false);
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
        showSnackbar(
          result.error.message || "An error occurred during payment.",
          "error"
        );
      } else if (
        result.paymentIntent &&
        result.paymentIntent.status === "succeeded"
      ) {
        console.log("Payment succeeded!");

        // Query the users collection to find the document with the matching uid
        const usersCollection = collection(db, "users");
        const q = query(usersCollection, where("uid", "==", userData.uid));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          const userDoc = querySnapshot.docs[0].ref; // Get the reference to the document

          // Update the document with the new membership information
          await setDoc(
            userDoc,
            {
              membershipType: "VIP Membership",
              membershipUpgradeDate: new Date(),
              membershipExpirationDate: new Date(
                new Date().setFullYear(new Date().getFullYear() + 1)
              ),
            },
            { merge: true }
          );

          showSnackbar("Upgrade to VIP successful!", "success");
          onClose();

          await fetchUserData(userData.uid, userData.email);
        } else {
          console.error("No document found for this user.");
          showSnackbar("No document found for this user.", "error");
        }
      } else {
        showSnackbar("Unexpected payment result. Please try again.", "error");
      }
    } catch (error) {
      console.error("Error during payment:", error);
      showSnackbar("Payment failed. Please try again.", "error");
    } finally {
      setIsProcessing(false);
    }
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
          <form onSubmit={handlePaymentSubmission}>
            <PaymentElement />
            <Button
              type="submit"
              className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-md transition duration-200 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isProcessing || !stripe || !elements}
            >
              {isProcessing ? "Processing..." : "Submit Payment"}
            </Button>

            <Button
              variant="outline"
              className="w-full py-3 px-4 mt-4 border-gray-300 text-gray-600 hover:bg-gray-100 dark:text-white dark:hover:bg-gray-600 dark:border-gray-600 transition duration-200 ease-in-out"
              onClick={onClose}
            >
              Cancel
            </Button>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default UpgradeModal;

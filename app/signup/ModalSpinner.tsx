import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { LoaderIcon } from "lucide-react"; // Assuming you're using Lucide for icons.

interface PaymentProcessingModalProps {
  isVisible: boolean;
  status?: "pending" | "success" | "failed";
  onClose?: () => void;
}

export const PaymentProcessingModal: React.FC<PaymentProcessingModalProps> = ({
  isVisible,
  status = "pending",
  onClose,
}) => {
  let modalContent;

  if (status === "pending") {
    modalContent = (
      <div className="flex flex-col items-center justify-center space-y-4">
        <LoaderIcon className="animate-spin text-green-500 w-16 h-16" />
        <p className="text-xl font-semibold text-center text-gray-700 dark:text-gray-300">
          Please do not hit refresh or back button!
          <br />
          <span className="font-normal">Please wait for payment confirmation.</span>
        </p>
      </div>
    );
  } else if (status === "success") {
    modalContent = (
      <div className="flex flex-col items-center justify-center space-y-4">
        <div className="text-green-500 text-6xl">✔</div>
        <p className="text-xl font-semibold text-center text-green-600 dark:text-green-400">
          Payment successful!
        </p>
        <p className="text-md text-center text-gray-600 dark:text-gray-400">
          You can now proceed with the next steps.
        </p>
      </div>
    );
  } else {
    modalContent = (
      <div className="flex flex-col items-center justify-center space-y-4">
        <div className="text-red-500 text-6xl">✖</div>
        <p className="text-xl font-semibold text-center text-red-600 dark:text-red-400">
          Payment failed!
        </p>
        <p className="text-md text-center text-gray-600 dark:text-gray-400">
          Please try again or contact support.
        </p>
      </div>
    );
  }

  return (
    <AnimatePresence>
      {isVisible && (
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
            className="bg-white dark:bg-gray-800 p-10 rounded-none shadow-none w-full h-full flex flex-col items-center justify-center"
          >
            {modalContent}
            {status !== "pending" && (
              <button
                className="mt-8 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md font-medium transition ease-in-out duration-300"
                onClick={onClose}
              >
                Close
              </button>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

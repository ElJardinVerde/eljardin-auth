import React from "react";
import { motion } from "framer-motion";
import Image from "next/image";

export const ModalSpinner = ({ isVisible }: { isVisible: boolean }) => {
  if (!isVisible) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70"
    >
      <div className="relative flex flex-col items-center">
        <div className="relative h-32 w-32 flex items-center justify-center">
          <Image
            src="/eljardinlogo.jpg"
            alt="El Jardin Logo"
            width={64} 
            height={64}
            className="absolute rounded-full"
          />
          <div className="loader ease-linear rounded-full border-8 border-t-8 border-gray-200 h-full w-full"></div>
        </div>
        <p className="text-white text-xl mt-4">Loading...Please wait!</p>
      </div>
    </motion.div>
  );
};

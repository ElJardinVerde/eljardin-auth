"use client";
import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { Boxes } from "./ui/background-boxes";
import { cn as aceternityCn } from "../utils/cn";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import ThemeToggle from "../components/ThemeToggle";
import { useTheme } from "../context/ThemeContext";
import { auth, db } from "../api/firebaseConfig";
import {
  collection,
  query,
  where,
  getDocs,
  updateDoc,
  doc,
} from "firebase/firestore";
import { DotBackgroundDemo } from "./ui/background";

type QrScannerProps = {
  delay?: number;
  onError: (err: any) => void;
  onScan: (data: { text: string } | null) => void;
  style?: React.CSSProperties;
};

const QrScanner = dynamic(() => import("react-qr-scanner"), {
  ssr: false,
}) as React.ComponentType<QrScannerProps>;

export function Authentification() {
  const { theme } = useTheme();
  const [showScanner, setShowScanner] = useState(false);
  const [qrData, setQrData] = useState("");
  const [isValidQR, setIsValidQR] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(false);
  const [cameraError, setCameraError] = useState(false);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isValidQR !== null) {
      timer = setTimeout(() => {
        closeModal();
      }, 5000);
    }
    return () => clearTimeout(timer);
  }, [isValidQR]);

  const handleScan = async (data: { text: string } | null) => {
    if (data) {
      setQrData(data.text);
      setShowScanner(false);
      setLoading(true);

      try {
        const q = query(
          collection(db, "qrCodes"),
          where("qrCodeData", "==", data.text)
        );
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
          console.log("No matching QR code document found");
          setIsValidQR(false);
          setLoading(false);
          return;
        }

        const qrCodeDoc = querySnapshot.docs[0];
        const qrCodeData = qrCodeDoc.data();
        console.log("QR Code Document Data:", qrCodeData);

        if (qrCodeData.used) {
          console.log("QR Code has already been used");
          setIsValidQR(false);
        } else {
          await updateDoc(doc(db, "qrCodes", qrCodeDoc.id), {
            used: true,
          });
          console.log("QR Code marked as used");
          setIsValidQR(true);
        }

        setLoading(false);
      } catch (error) {
        console.error("Error validating QR Code:", error);
        setIsValidQR(false);
        setLoading(false);
      }
    }
  };

  const handleError = (err: any) => {
    console.error(err);
    setCameraError(true);
    setShowScanner(false);
  };

  const closeScanner = () => {
    setShowScanner(false);
    setCameraError(false);
  };

  const closeModal = () => {
    setIsValidQR(null);
    setQrData("");
    setCameraError(false);
  };

  const previewStyle = {
    height: 240,
    width: 320,
  };

  return (
    <div className="h-screen w-full dark:bg-black bg-white dark:bg-dot-white/[0.3] bg-dot-black/[0.3] relative flex items-center justify-center">
      <div className="absolute pointer-events-none inset-0 flex items-center justify-center dark:bg-black bg-white [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]"></div>

      <div className="relative z-20 flex flex-col items-center justify-center">
        <ThemeToggle />

        <h1 className="animate-fade-in text-center text-6xl dark:text-white  relative z-20">
          Welcome to ElJardin
          <span className="text-green-300">Verde </span>
          Club!
        </h1>
        <p className="text-center mt-6 text-gray-900 dark:text-gray-300 relative z-20">
          Please scan your QR code here!
        </p>

        {!showScanner && (
          <div className="relative z-20 pt-10">
            <Button
              variant="outline"
              className="w-64"
              onClick={() => setShowScanner(true)}
            >
              Scan QR
            </Button>
          </div>
        )}
        {showScanner && (
          <div className="relative z-20 pt-10 w-full flex flex-col items-center">
            <QrScanner
              delay={300}
              onError={handleError}
              onScan={handleScan}
              style={previewStyle}
            />
            <Button variant="outline" className="mt-4" onClick={closeScanner}>
              Close Camera
            </Button>
          </div>
        )}
        {cameraError && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="bg-white p-8 rounded-lg shadow-lg text-center flex flex-col items-center"
            >
              <p className="text-lg font-medium text-red-500">
                Failed to open camera. Please try again.
              </p>
              <Button variant="outline" className="mt-4" onClick={closeModal}>
                Try Again
              </Button>
            </motion.div>
          </div>
        )}
        <AnimatePresence>
          {loading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50"
            >
              <motion.div
                initial={{ y: -50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 50, opacity: 0 }}
                className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-2xl text-center flex flex-col items-center max-w-md w-full mx-4"
              >
                <div className="relative w-20 h-20 mb-6">
                  <div className="absolute top-0 left-0 w-full h-full border-4 border-green-500 rounded-full animate-pulse"></div>
                  <div className="absolute top-0 left-0 w-full h-full border-t-4 border-green-500 rounded-full animate-spin"></div>
                </div>
                <p className="text-xl font-semibold text-gray-700 dark:text-gray-200">
                  Verifying QR Code
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                  Please wait a moment...
                </p>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {isValidQR !== null && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className={`bg-white dark:bg-gray-800 p-8 rounded-xl shadow-2xl text-center max-w-md w-full 
                ${
                  isValidQR
                    ? "bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900 dark:to-green-800"
                    : "bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900 dark:to-red-800"
                }`}
              >
                {isValidQR ? (
                  <>
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{
                        type: "spring",
                        stiffness: 260,
                        damping: 20,
                      }}
                      className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6"
                    >
                      <svg
                        className="w-12 h-12 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    </motion.div>
                    <h2 className="text-3xl font-bold text-green-600 dark:text-green-400 mb-4">
                      Welcome to ElJardinVerde Club!
                    </h2>
                    <p className="text-xl text-gray-700 dark:text-gray-300">
                      Your access has been approved!
                    </p>
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 }}
                      className="mt-6"
                    >
                      <span className="text-4xl">🎉</span>
                    </motion.div>
                  </>
                ) : (
                  <>
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{
                        type: "spring",
                        stiffness: 260,
                        damping: 20,
                      }}
                      className="w-20 h-20 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-6"
                    >
                      <svg
                        className="w-12 h-12 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </motion.div>
                    <h2 className="text-3xl font-bold text-red-600 dark:text-red-400 mb-4">
                      QR Code Invalid
                    </h2>
                    <p className="text-xl text-gray-700 dark:text-gray-300 mb-6">
                      Your QR code is not valid or has already been used. Please
                      try again!
                    </p>
                    <Button
                      variant="outline"
                      className="mt-4 bg-white text-red-500 border-red-500 hover:bg-red-50 dark:bg-gray-700 dark:text-red-400 dark:border-red-400 dark:hover:bg-red-900"
                      onClick={closeModal}
                    >
                      Try Again
                    </Button>
                  </>
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
        <p className="text-center mt-6 text-gray-900 dark:text-gray-300 relative z-20">
          Not a member yet?{" "}
          <a
            href="/signup"
            className="text-green-600 dark:text-green-400 underline"
          >
            Sign Up
          </a>
        </p>
        <p className="text-center mt-6 text-gray-900 dark:text-gray-300 relative z-20">
          Are you a member?{" "}
          <a
            href="/login"
            className="text-green-600 dark:text-green-400 underline"
          >
            Login here
          </a>
        </p>
      </div>
    </div>
  );
}

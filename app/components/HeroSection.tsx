"use client";
import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { Boxes } from "./ui/background-boxes";
import { cn as aceternityCn } from "../utils/cn";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import ThemeToggle from "../components/ThemeToggle";
import { useTheme } from "../context/ThemeContext";
import { auth, db } from "../api/firebaseConfig"; // Make sure this import is correct
import {
  collection,
  query,
  where,
  getDocs,
  updateDoc,
  doc,
} from "firebase/firestore";

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
    <div className="min-h-screen relative w-full overflow-hidden bg-slate-900 flex flex-col items-center justify-center">
      <ThemeToggle />
      <div className="absolute inset-0 w-full h-full bg-slate-900 z-20 [mask-image:radial-gradient(transparent,white)] pointer-events-none" />
      <Boxes />
      <h1 className="animate-fade-in text-center text-6xl text-white relative z-20">
        Welcome to ElJardin
        <span className="text-green-300">Verde </span>
        Club!
      </h1>
      <p className="text-center mt-6 text-neutral-300 relative z-20">
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
      {loading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="bg-white p-8 rounded-lg shadow-lg text-center flex flex-col items-center"
          >
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-green-500 mb-4"></div>
            <p className="text-lg font-medium">Checking QR code...</p>
          </motion.div>
        </div>
      )}
      <AnimatePresence>
        {isValidQR !== null && (
          <div className="fixed inset-0 mx-2 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="bg-white p-8 rounded-lg shadow-lg text-center"
            >
              {isValidQR ? (
                <>
                  <h2 className="text-2xl font-bold text-green-500 mb-4">
                    Welcome to ElJardinVerde Club!
                  </h2>
                  <p className="text-lg">Your access has been approved!</p>
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="mt-4"
                  >
                    <div className="text-green-500 animate-bounce">🎉</div>
                  </motion.div>
                </>
              ) : (
                <>
                  <h2 className="text-2xl font-bold text-red-500 mb-4">
                    QR Code Invalid
                  </h2>
                  <p className="text-lg">
                    Your QR code is not valid or it has been already used! Please try again!
                  </p>
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="mt-4"
                  >
                    <div className="text-red-500 animate-bounce">⚠️</div>
                  </motion.div>
                  <Button
                    variant="outline"
                    className="mt-4"
                    onClick={closeModal}
                  >
                    Try Again
                  </Button>
                </>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      <p className="text-center mt-6 text-neutral-300 relative z-20">
        Not a member yet?{" "}
        <a href="/signup" className="text-green-300 underline">
          Sign Up
        </a>
      </p>
      <p className="text-center mt-6 text-neutral-300 relative z-20">
        Are you a member?{" "}
        <a href="/login" className="text-green-300 underline">
          Login here
        </a>
      </p>
    </div>
  );
}

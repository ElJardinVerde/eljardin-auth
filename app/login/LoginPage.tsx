"use client";

import React, { useState, useEffect } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useRouter } from "next/navigation";
import { signInWithEmailAndPassword } from "firebase/auth";
import QRCode from "qrcode";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Button } from "../../components/ui/button";
import { useTheme } from "../context/ThemeContext";
import { auth, db } from "../api/firebaseConfig";
import { Snackbar } from "../components/Snackbar";
import { collection, query, where, getDocs, addDoc } from "firebase/firestore";
import MembershipCard from "./MembershipCard";
import { sendPasswordResetEmail } from "firebase/auth";
import ForgotPasswordModal from "./ForgotPass";
import UserInfoCard from "../login/UserData";
import UpgradeModal from "./UpgradeModal";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import MemberCountDisplay from "./DatabaseMembers";
import { ModalSpinner } from "@/components/ui/spinner";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";
import Image from "next/image";

const stripePromise = loadStripe(
  "pk_live_51Ob2fwJPY3RNRZWOedZj2YIynTY1aEIIP3IapfteD0kdIFYiRIbHAtXa6pCr5juKmjhBm63DpAGEOVLHl79BAJ7E00vQLcWUze"
);

export default function LoginPage() {
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [snackbar, setSnackbar] = useState<{
    show: boolean;
    message: string;
    type: "success" | "error";
  }>({ show: false, message: "", type: "success" });
  const [userData, setUserData] = useState<{
    uid: string;
    firstName: string;
    lastName: string;
    email: string;
    club?: string;
    country?: string;
    dob?: string;
    identification?: string;
    membershipActivationDate?: string;
    membershipExpirationDate?: string;
    membershipType?: string;
    photo?: string;
    placeOfBirth?: string;
  } | null>(null);
  const { theme } = useTheme();
  const router = useRouter();
  const [isForgotPasswordModalOpen, setIsForgotPasswordModalOpen] =
    useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [isModalLoading, setIsModalLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    setIsModalLoading(true);
    setTimeout(() => setIsModalLoading(false), 1000);
  }, []);

  const handleUpgrade = async () => {
    console.log("Opening upgrade modal...");

    try {
      const response = await fetch("/api/payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: 2500 }),
      });

      const data = await response.json();
      if (data.clientSecret) {
        setClientSecret(data.clientSecret);
        setIsUpgradeModalOpen(true);
        console.log("Client secret set successfully");
      } else {
        throw new Error("No client secret received from the server");
      }
    } catch (error) {
      console.error("Error creating payment intent:", error);
      setSnackbar({
        show: true,
        message: "Failed to initialize payment. Please try again.",
        type: "error",
      });
    }
  };

  const fetchUserData = async (uid: string, email: string) => {
    try {
      const usersCollection = collection(db, "users");
      const q = query(usersCollection, where("uid", "==", uid));
      const querySnapshot = await getDocs(q);
      if (querySnapshot.empty) {
        console.log("No such document!");
        return;
      }
      const userDoc = querySnapshot.docs[0];
      const userData = userDoc.data();
      console.log("Fetched user data:", userData);

      setUserData({
        uid: userData.uid,
        firstName: userData.firstName,
        lastName: userData.lastName,
        email: userData.email,
        club: userData.club,
        country: userData.country,
        dob: userData.dob?.toDate().toLocaleDateString(),
        identification: userData.identification,
        membershipActivationDate: userData.membershipActivationDate
          ?.toDate()
          .toLocaleDateString(),
        membershipExpirationDate: userData.membershipExpirationDate
          ?.toDate()
          .toLocaleDateString(),
        membershipType: userData.membershipType,
        photo: userData.photo,
        placeOfBirth: userData.placeOfBirth,
      });
      console.log("User data set successfully");

      const allowedAdminEmails = [
        "iulianpampu@icloud.com",
        "alexnemes23@yahoo.com",
        "dahmadrian1@gmail.com",
        "gabiro_albu@yahoo.com",
        "eljardinverde.clubsocial@yahoo.com",
      ];
      setIsAdmin(allowedAdminEmails.includes(email));
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  const formik = useFormik({
    initialValues: {
      email: "",
      password: "",
    },
    validationSchema: Yup.object({
      email: Yup.string()
        .email("Invalid email address")
        .required("Email is required"),
      password: Yup.string()
        .required("Password is required")
        .min(8, "Password must be at least 8 characters"),
    }),
    onSubmit: async (values) => {
      setIsModalLoading(true);
      try {
        const userCredential = await signInWithEmailAndPassword(
          auth,
          values.email,
          values.password
        );
        const user = userCredential.user;
        console.log("User signed in:", user);
        await fetchUserData(user.uid, user.email || "");
        setSnackbar({
          show: true,
          message: "Login successful!",
          type: "success",
        });
        setTimeout(() => {
          setSnackbar({ show: false, message: "", type: "success" });
          setIsModalLoading(false);
        }, 1500);
      } catch (error) {
        console.error("Error during login:", error);
        setSnackbar({
          show: true,
          message: "Login failed. Please check your credentials.",
          type: "error",
        });
        setTimeout(() => {
          setSnackbar({ show: false, message: "", type: "error" });
          setIsModalLoading(false);
        }, 1500);
      }
    },
  });

  const generateQRCode = async () => {
    if (!userData?.uid) {
      console.error("UID is undefined or null");
      return;
    }

    const qrCodeData = `${userData.uid}-${Date.now().toString()}`;
    const qrCodeUrl = await QRCode.toDataURL(qrCodeData);

    await addDoc(collection(db, "qrCodes"), {
      uid: userData.uid,
      qrCodeData: qrCodeData,
      createdAt: new Date(),
      used: false,
    });

    console.log("QR code generated is stored in database!");
    setQrCode(qrCodeUrl);
  };

  const handleForgotPassword = async (email: string) => {
    console.log("Attempting to send password reset email to:", email);

    try {
      await sendPasswordResetEmail(auth, email);
      console.log("Password reset email sent successfully.");

      setSnackbar({
        show: true,
        message: "Password reset email sent!",
        type: "success",
      });
    } catch (error) {
      console.error("Error sending password reset email:", error);

      if (error instanceof Error) {
        console.log("Error type identified:", error.message);

        if (error.message.includes("auth/user-not-found")) {
          setSnackbar({
            show: true,
            message: "No user found with that email.",
            type: "error",
          });
        } else if (error.message.includes("auth/invalid-email")) {
          setSnackbar({
            show: true,
            message: "Invalid email address.",
            type: "error",
          });
        } else {
          setSnackbar({
            show: true,
            message:
              "Failed to send password reset email. Please try again later.",
            type: "error",
          });
        }
      } else {
        setSnackbar({
          show: true,
          message: "An unexpected error occurred.",
          type: "error",
        });
      }
    }
  };

  const handleSnackbar = (message: string, type: "success" | "error") => {
    setSnackbar({ show: true, message, type });
    setTimeout(() => {
      setSnackbar({ ...snackbar, show: false });
    }, 3000);
  };

  const hideSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, show: false }));
  };

  const showSnackbar = (message: string, type: "success" | "error") => {
    setSnackbar({ message, type, show: true });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white dark:bg-black dark:bg-dot-white/[0.2] bg-dot-black/[0.2]">
      <ModalSpinner isVisible={isModalLoading} />

      <div className="max-w-md w-full mx-auto rounded-lg bg-white dark:bg-black p-8 dark:bg-dot-white/[0.2] bg-dot-black/[0.2]">
        {userData ? (
          <div className="space-y-10 min-h-screen mt-10">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 text-center">
              Welcome, {userData.firstName} {userData.lastName}!
            </h2>
            {isAdmin && (
              <div className="text-center">
                <p className="text-green-500 font-bold">Admin Account</p>
              </div>
            )}
            {isAdmin && (
              <div className="flex justify-center">
                <Button onClick={() => router.push("/admin")} className="w-64">
                  Go to Admin Page
                </Button>
              </div>
            )}
            <p className="text-center text-gray-600 dark:text-gray-400">
              This is your email used for logging in: {userData.email}
            </p>
            <div>
              <MemberCountDisplay />
            </div>
            <div className="flex justify-center">
              <MembershipCard userData={userData} />
            </div>
            <div className="flex justify-center">
              <UserInfoCard userData={userData} />
            </div>
            {userData.membershipType === "Regular member" && (
              <div className="flex justify-center">
                <Button
                  onClick={handleUpgrade}
                  className="w-64 bg-green-500 hover:bg-green-600"
                >
                  Upgrade to VIP
                </Button>
              </div>
            )}
            <div className="flex justify-center">
              <Button onClick={generateQRCode}>Generate QR Code</Button>
            </div>
            {qrCode && (
              <div className="mt-8 text-center">
                <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200">
                  Your QR Code for club access:
                </h3>

                <Image
                  src={qrCode}
                  alt="QR Code"
                  width={256}
                  height={256}
                  className="mx-auto mt-4"
                />

                <div className="flex justify-center mt-4">
                  <Button className="w-64" onClick={() => setQrCode(null)}>
                    Dismiss
                  </Button>
                </div>
              </div>
            )}
            <div className="flex justify-center">
              <Button
                className="w-64"
                onClick={() => {
                  auth.signOut();
                  router.push("/");
                }}
              >
                Logout
              </Button>
            </div>
          </div>
        ) : (
          <>
            <div className="flex justify-center mb-6">
              <Image
                src="/eljardinlogo.JPG"
                alt="El Jardin Logo"
                width={64}
                height={64}
              />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 text-center mb-8">
              Login to Your Account
            </h2>

            <form className="space-y-6" onSubmit={formik.handleSubmit}>
              <LabelInputContainer>
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  placeholder="Your email address"
                  type="email"
                  {...formik.getFieldProps("email")}
                />
                {formik.touched.email && formik.errors.email ? (
                  <div className="text-red-600 text-sm">
                    {formik.errors.email}
                  </div>
                ) : null}
              </LabelInputContainer>

              <LabelInputContainer>
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    placeholder="••••••••"
                    type={showPassword ? "text" : "password"}
                    {...formik.getFieldProps("password")}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-3 flex items-center text-gray-600"
                  >
                    {showPassword ? (
                      <EyeSlashIcon className="h-5 w-5" />
                    ) : (
                      <EyeIcon className="h-5 w-5" />
                    )}
                  </button>
                </div>
                {formik.touched.password && formik.errors.password ? (
                  <div className="text-red-600 text-sm">
                    {formik.errors.password}
                  </div>
                ) : null}
              </LabelInputContainer>

              <div className="text-center mt-4">
                <Button type="submit" className="w-full">
                  Login
                </Button>
              </div>
              <button
                type="button"
                onClick={() => setIsForgotPasswordModalOpen(true)}
                className="text-sm text-center items-center justify-center text-green-300 dark:text-green-00 hover:underline"
              >
                Forgot Password?
              </button>
            </form>

            <p className="text-center text-gray-600 dark:text-gray-400 mt-6">
              Not a member?{" "}
              <a
                href="/signup"
                className="text-green-300 dark:text-green-300 hover:underline"
              >
                Sign Up here!
              </a>
            </p>
          </>
        )}
        <Snackbar
          message={snackbar.message}
          type={snackbar.type}
          show={snackbar.show}
          onClose={hideSnackbar}
        />
        <ForgotPasswordModal
          isOpen={isForgotPasswordModalOpen}
          setIsOpen={setIsForgotPasswordModalOpen}
          sendPasswordReset={(email) => handleForgotPassword(email)}
          onSnackbar={handleSnackbar}
        />
        {isUpgradeModalOpen && clientSecret && (
          <Elements stripe={stripePromise} options={{ clientSecret }}>
            <UpgradeModal
              userData={userData!}
              showSnackbar={showSnackbar}
              fetchUserData={fetchUserData}
              onClose={() => setIsUpgradeModalOpen(false)}
            />
          </Elements>
        )}
      </div>
    </div>
  );
}

const LabelInputContainer = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <div className={`flex flex-col space-y-2 w-full ${className}`}>
      {children}
    </div>
  );
};

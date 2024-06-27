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
  } | null>(null);
  const { theme } = useTheme();
  const router = useRouter();

  const fetchUserData = async (uid: string) => {
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
      setUserData({
        uid: userData.uid,
        firstName: userData.firstName,
        lastName: userData.lastName,
        email: userData.email,
      });
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
      try {
        const userCredential = await signInWithEmailAndPassword(
          auth,
          values.email,
          values.password
        );
        const user = userCredential.user;
        await fetchUserData(user.uid);
        setSnackbar({
          show: true,
          message: "Login successful!",
          type: "success",
        });
        setTimeout(
          () => setSnackbar({ show: false, message: "", type: "success" }),
          3000
        );
      } catch (error) {
        console.error("Error during login:", error);
        setSnackbar({
          show: true,
          message: "Login failed. Please check your credentials.",
          type: "error",
        });
        setTimeout(
          () => setSnackbar({ show: false, message: "", type: "error" }),
          3000
        );
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

  return (
    <div className="min-h-screen flex items-center justify-center bg-white dark:bg-black">
      <div className="max-w-md w-full mx-auto rounded-lg bg-white dark:bg-black p-8">
        {userData ? (
          <div className="space-y-10 min-h-screen mt-10">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 text-center">
              Welcome, {userData.firstName} {userData.lastName}!
            </h2>
            <p className="text-center text-gray-600 dark:text-gray-400">
              This is your email used for logging in: {userData.email}
            </p>
            <div className="flex justify-center">
              <MembershipCard userData={userData} />
            </div>
            <div className="flex justify-center">
              <Button onClick={generateQRCode}>Generate QR Code</Button>
            </div>
            {qrCode && (
              <div className="mt-8 text-center">
                <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200">
                  Your QR Code for club access:
                </h3>

                <img
                  src={qrCode}
                  alt="QR Code"
                  className="mx-auto mt-4 w-64 h-64"
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
            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 text-center mb-6">
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
                <Input
                  id="password"
                  placeholder="••••••••"
                  type="password"
                  {...formik.getFieldProps("password")}
                />
                {formik.touched.password && formik.errors.password ? (
                  <div className="text-red-600 text-sm">
                    {formik.errors.password}
                  </div>
                ) : null}
              </LabelInputContainer>

              <div className="flex justify-center">
                <Button type="submit" className="w-full">
                  Login
                </Button>
              </div>
            </form>

            <p className="text-center text-gray-600 dark:text-gray-400 mt-6">
              Not a member?{" "}
              <a
                href="/signup"
                className="text-blue-600 dark:text-blue-400 hover:underline"
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
        />
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

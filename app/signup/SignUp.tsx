"use client";

import dynamic from "next/dynamic";
import React, { useState, useRef, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useFormik } from "formik";
import * as Yup from "yup";
import { Label } from "../components/ui/label";
import { Input } from "../components/ui/input";
import { cn as aceternityCn } from "../utils/cn";
import "react-datepicker/dist/react-datepicker.css";
import countryList from "react-select-country-list";
import { useTheme } from "../context/ThemeContext";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth, db, storage } from "../api/firebaseConfig";
import { collection, addDoc } from "firebase/firestore";
import bcrypt from "bcryptjs";
import { Snackbar } from "../components/Snackbar";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { Button } from "@/components/ui/button";
import Webcam, { WebcamProps } from "react-webcam";
import { loadStripe } from "@stripe/stripe-js";
import {
  useStripe,
  useElements,
  PaymentElement,
  Elements,
} from "@stripe/react-stripe-js";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { shadCn } from "@/lib/utils";
import { DropdownProps, CustomComponents } from "react-day-picker";
import { PaymentProcessingModal } from "./ModalSpinner";
import { ModalSpinner } from "@/components/ui/spinner";
import Image from "next/image";

const stripePromise = loadStripe(
  "pk_live_51Ob2fwJPY3RNRZWOedZj2YIynTY1aEIIP3IapfteD0kdIFYiRIbHAtXa6pCr5juKmjhBm63DpAGEOVLHl79BAJ7E00vQLcWUze"
);

const Select = dynamic(() => import("react-select"), { ssr: false });


export function SignUp() {
  const { theme } = useTheme();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const stripe = useStripe();
  const elements = useElements();
  const [clientSecret, setClientSecret] = useState("");
  const [isLoadingModal, setIsLoadingModal] = useState(false);

  const [dateOfBirth, setDateOfBirth] = useState<Date | null>(null);
  const [country, setCountry] = useState<any>(null);
  const [snackbar, setSnackbar] = useState<{
    show: boolean;
    message: string;
    type: "success" | "error";
  }>({ show: false, message: "", type: "success" });
  const webcamRef = useRef<Webcam>(null);
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [photoStatus, setPhotoStatus] = useState<string>("");
  const [isModalVisible, setIsModalVisible] = useState(false);

  const options = countryList().getData();
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState<boolean>(false);
  const [membership, setMembership] = useState("");
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [stripeElementsOptions, setStripeElementsOptions] = useState({
    clientSecret: "",
  });
  const [paymentStatus, setPaymentStatus] = useState<
    "pending" | "success" | "failed"
  >("pending");
  const [paymentIntentId, setPaymentIntentId] = useState<string | null>(null);

  const [membershipActivationDate, setMembershipActivationDate] =
    useState<Date | null>(null);
  const [membershipExpirationDate, setMembershipExpirationDate] =
    useState<Date | null>(null);

  const [capturedIDPhoto, setCapturedIDPhoto] = useState<string | null>(null);
  const [idPhotoStatus, setIDPhotoStatus] = useState<string>("");
  const [isIDCameraOpen, setIsIDCameraOpen] = useState(false);
  const [isIDModalOpen, setIsIDModalOpen] = useState(false);

  const [isSpainSelected, setIsSpainSelected] = useState(false);
  const [isTenerifeResident, setIsTenerifeResident] = useState(false);

  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);

  const handleBackClick = () => {
    router.push("/");
  };
  
  useEffect(() => {
    async function fetchPaymentSheet() {
      try {
        const response = await fetch("/api/sheet", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ amount: 5000 }),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        if (data.paymentIntent && data.ephemeralKey && data.customer) {
          setClientSecret(data.paymentIntent);
          setStripeElementsOptions({
            clientSecret: data.paymentIntent,
          });
        } else {
          throw new Error("Incomplete data received from the server");
        }
      } catch (error) {
        console.error("Error fetching payment sheet:", error);
        setSnackbar({
          show: true,
          message: "Failed to initialize payment. Please try again.",
          type: "error",
        });
      }
    }

    fetchPaymentSheet();
  }, []);

  useEffect(() => {
    setIsLoadingModal(true);
    setTimeout(() => setIsLoadingModal(false), 1000);
  }, []);

  const handleCountryChange = (selectedOption: any) => {
    setCountry(selectedOption);
    formik.setFieldValue("countryOfResidence", selectedOption);

    if (selectedOption?.label === "Spain") {
      setIsSpainSelected(true);
    } else {
      setIsSpainSelected(false);
      setIsTenerifeResident(false);
    }
  };

  const MembershipPaymentModal = () => {
    const [selectedMembership, setSelectedMembership] = useState<string | null>(
      null
    );

    const handleMembershipSelection = async (amount: number, type: string) => {
      setMembership(type);
      try {
        const response = await fetch("/api/payment", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ amount }),
        });
        const data = await response.json();
        if (data.clientSecret) {
          setClientSecret(data.clientSecret);
          setStripeElementsOptions({ clientSecret: data.clientSecret });
          setSelectedMembership(type);
        } else {
          console.error("Failed to fetch client secret", data);
        }
      } catch (error) {
        console.error("Error fetching client secret", error);
      }
    };

    const StripePaymentForm = () => {
      const stripe = useStripe();
      const elements = useElements();

      const handlePaymentSubmission = async (
        event: React.FormEvent<HTMLFormElement>
      ) => {
        event.preventDefault();

        if (!stripe || !elements) {
          console.error("Stripe.js has not loaded yet.");
          setSnackbar({
            show: true,
            message: "Stripe.js is not loaded. Please try again.",
            type: "error",
          });
          return;
        }

        const paymentElement = elements.getElement(PaymentElement);

        if (!paymentElement) {
          console.error("Payment Element has not been properly initialized");
          setSnackbar({
            show: true,
            message: "Payment form is not ready. Please try again",
            type: "error",
          });
          return;
        }

        setIsModalVisible(true);
        setPaymentStatus("pending");

        try {
          const result = await stripe.confirmPayment({
            elements,
            confirmParams: {
              return_url: "https://auth.eljardinverde.org/signup",
            },
            redirect: "if_required",
          });

          if (result.error) {
            console.log(result.error.message);
            setSnackbar({
              show: true,
              message:
                result.error.message || "An error occurred during payment.",
              type: "error",
            });
            setPaymentStatus("failed");
          } else if (
            result.paymentIntent &&
            result.paymentIntent.status === "succeeded"
          ) {
            console.log("Payment succeeded!");
            const intentId = result.paymentIntent.id;
            setPaymentIntentId(intentId);
            console.log("Payment intent ID:", paymentIntentId);
            setPaymentSuccess(true);
            setPaymentStatus("success");
            setSnackbar({
              show: true,
              message:
                "Payment successful! Now you can submit your membership!",
              type: "success",
            });
            setIsPaymentModalOpen(false);
          } else {
            console.error("Unexpected payment result:", result);
            setSnackbar({
              show: true,
              message: "Unexpected payment result. Please try again.",
              type: "error",
            });
            setPaymentStatus("failed");
          }
        } catch (error) {
          console.error("Payment failed", error);
          setSnackbar({
            show: true,
            message: "Payment failed. Please try again.",
            type: "error",
          });
          setPaymentStatus("failed");
        }
      };

      const handleModalClose = () => {
        setIsModalVisible(false);
        setPaymentStatus("pending");
      };

      return (
        <>
          <form
            onSubmit={handlePaymentSubmission}
            className="bg-white dark:bg-gray-800 p-4 sm:p-8 rounded-xl shadow-md max-w-xl w-full mx-auto relative"
            style={{
              maxHeight: "100vh",
              overflowY: "auto",
            }}
          >
            <h3 className="text-2xl font-semibold text-gray-800 dark:text-white mb-6 text-center">
              Complete your payment for{" "}
              <span className="text-blue-600 dark:text-blue-400">
                {selectedMembership}
              </span>
            </h3>
            <div className="mb-6">
              <PaymentElement className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg w-full" />
            </div>
            <div
              style={{
                position: "sticky",
                bottom: 0,
                backgroundColor: "white",
                padding: "1rem",
              }}
            >
              <button
                type="submit"
                className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-md transition duration-200 ease-in-out mb-4 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={!stripe || !elements}
              >
                Submit Payment
              </button>
              <button
                onClick={() => {
                  setIsPaymentModalOpen(false);
                  setSelectedMembership(null);
                  setClientSecret("");
                }}
                className="w-full py-3 px-4 bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 text-gray-800 dark:text-white font-semibold rounded-lg shadow-md transition duration-200 ease-in-out"
              >
                Cancel
              </button>
            </div>
          </form>
          <PaymentProcessingModal
            isVisible={isModalVisible}
            status={paymentStatus}
            onClose={handleModalClose}
          />
          Z
        </>
      );
    };

    return (
      <AnimatePresence>
        {isPaymentModalOpen && (
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
                    Select Membership
                  </h3>
                  <div className="space-y-4">
                    <button
                      onClick={() =>
                        handleMembershipSelection(2500, "Regular member")
                      }
                      className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-md transition duration-200 ease-in-out flex items-center justify-between"
                    >
                      <span>Regular member</span>
                      <span className="bg-blue-500 py-1 px-2 rounded-md text-sm">
                        25 EUR
                      </span>
                    </button>
                    <button
                      onClick={() =>
                        handleMembershipSelection(5000, "VIP member")
                      }
                      className="w-full py-3 px-4 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg shadow-md transition duration-200 ease-in-out flex items-center justify-between"
                    >
                      <span>VIP member</span>
                      <span className="bg-purple-500 py-1 px-2 rounded-md text-sm">
                        50 EUR
                      </span>
                    </button>
                  </div>
                  <button
                    onClick={() => setIsPaymentModalOpen(false)}
                    className="w-full py-3 px-4 bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 text-gray-800 dark:text-white font-semibold rounded-lg shadow-md transition duration-200 ease-in-out"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <Elements
                  stripe={stripePromise}
                  options={stripeElementsOptions}
                >
                  <StripePaymentForm />
                </Elements>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    );
  };

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      setDateOfBirth(date);
      formik.setFieldValue("dob", date);
      setIsPopoverOpen(false);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.currentTarget.files?.[0];
    if (file) {
      formik.setFieldValue("uploadPhoto", file);
      setPhotoStatus("Photo was uploaded");
    }
    handleCloseModal();
  };

  const formik = useFormik({
    initialValues: {
      firstname: "",
      lastname: "",
      dob: null as Date | null,
      placeOfBirth: "",
      countryOfResidence: null as { label: string; value: string } | null,
      formOfIdentification: "",
      uploadPhoto: null,
      uploadIDPhoto: null,
      email: "",
      password: "",
      retypePassword: "",
      club: "",
    },
    validationSchema: Yup.object({
      firstname: Yup.string().required("First name is required"),
      lastname: Yup.string().required("Last name is required"),
      dob: Yup.date().required("Date of birth is required"),
      placeOfBirth: Yup.string().required("Place of birth is required"),
      countryOfResidence: Yup.object({
        label: Yup.string().required(),
        value: Yup.string().required(),
      })
        .nullable()
        .required("Country of residence is required"),
      formOfIdentification: Yup.string().required(
        "Form of identification is required"
      ),
      uploadPhoto: Yup.mixed().required("Photo is required"),
      uploadIDPhoto: Yup.mixed().required("ID photo is required"),
      email: Yup.string()
        .email("Invalid email address")
        .required("Email is required"),
      password: Yup.string()
        .required("Password is required")
        .min(8, "Password must be at least 8 characters"),
      retypePassword: Yup.string()
        .required("Retype your password")
        .oneOf([Yup.ref("password")], "Passwords must match"),
      club: Yup.string().required("Club is required"),
    }),
    onSubmit: async (values) => {
      if (!isTenerifeResident && (!paymentSuccess || !paymentIntentId)) {
        setSnackbar({
          show: true,
          message: "Complete payment to register.",
          type: "error",
        });
        return;
      }
      if (!values.dob) {
        setSnackbar({
          show: true,
          message: "Date of birth is required",
          type: "error",
        });
        return;
      }
      try {
        console.log("Age validation passed: User is over 18.");

        const hashedPassword = await bcrypt.hash(values.password, 10);
        const userCredential = await createUserWithEmailAndPassword(
          auth,
          values.email,
          values.password
        );
        const user = userCredential.user;

        let photoURL = "";
        if (values.uploadPhoto) {
          const imageRef = ref(storage, `userPhotos/${user.uid}-selfie`);
          let blob;
          if (typeof values.uploadPhoto === "string") {
            const response = await fetch(values.uploadPhoto);
            blob = await response.blob();
          } else {
            blob = values.uploadPhoto;
          }
          await uploadBytes(imageRef, blob);
          photoURL = await getDownloadURL(imageRef);
        }

        let idPhotoURL = "";
        if (values.uploadIDPhoto) {
          const idPhotoRef = ref(storage, `userIDPhotos/${user.uid}-id`);
          let idBlob;
          if (typeof values.uploadIDPhoto === "string") {
            const idResponse = await fetch(values.uploadIDPhoto);
            idBlob = await idResponse.blob();
          } else {
            idBlob = values.uploadIDPhoto;
          }
          await uploadBytes(idPhotoRef, idBlob);
          idPhotoURL = await getDownloadURL(idPhotoRef);
        }

        const finalMembership = isTenerifeResident
          ? "Regular member"
          : membership;

        await addDoc(collection(db, "users"), {
          uid: user.uid,
          firstName: values.firstname,
          lastName: values.lastname,
          firstNameLower: values.firstname.toLowerCase(),
          dob: values.dob,
          placeOfBirth: values.placeOfBirth,
          country: values.countryOfResidence?.label || "",
          identification: values.formOfIdentification,
          email: values.email,
          photo: photoURL,
          idPhoto: idPhotoURL,
          password: hashedPassword,
          club: values.club,
          membershipActivationDate: new Date(),
          membershipExpirationDate: new Date(
            new Date().setFullYear(new Date().getFullYear() + 1)
          ),
          isAdmin: false,
          membershipType: finalMembership,
          paymentMethod: isTenerifeResident ? "None" : "credit card",
          paymentIntentId: isTenerifeResident ? null : paymentIntentId,
        });

        setSnackbar({
          show: true,
          message: "Registration completed! Redirecting to login page.",
          type: "success",
        });
        setTimeout(() => {
          router.push("/login");
        }, 4000);
      } catch (error: any) {
        if (error.code === "auth/email-already-in-use") {
          setSnackbar({
            show: true,
            message: "Email already in use",
            type: "error",
          });
        } else {
          setSnackbar({
            show: true,
            message: "User was not created! Database error!",
            type: "error",
          });
        }
      }
    },
  });

  const handleCapturePhoto = useCallback(() => {
    if (webcamRef.current) {
      const imageSrc = webcamRef.current.getScreenshot();
      setCapturedPhoto(imageSrc);
      formik.setFieldValue("uploadPhoto", imageSrc);
      setPhotoStatus("Photo was taken");
      setIsCameraOpen(false);
    }
  }, [webcamRef, formik]);

  const handleIDCapturePhoto = useCallback(() => {
    if (webcamRef.current) {
      const imageSrc = webcamRef.current.getScreenshot();
      setCapturedIDPhoto(imageSrc);
      formik.setFieldValue("uploadIDPhoto", imageSrc);
      setIDPhotoStatus("ID Photo was taken");
      setIsIDCameraOpen(false);
    }
  }, [webcamRef, formik]);

  const handleIDFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.currentTarget.files?.[0];
    if (file) {
      formik.setFieldValue("uploadIDPhoto", file);
      setIDPhotoStatus("ID Photo was uploaded");
    }
    setIsIDModalOpen(false);
  };

  const customStyles = {
    control: (provided: any, state: any) => ({
      ...provided,
      backgroundColor: theme === "dark" ? "#3f3f3f" : "#f5f5f5",
      borderColor: theme === "dark" ? "#3f3f3f" : "#ccc",
      color: theme === "dark" ? "#f4f4f5" : "#333",
      boxShadow: state.isFocused ? null : null,
      "&:hover": {
        borderColor: theme === "dark" ? "#3f3f3f" : "#bbb",
      },
    }),
    singleValue: (provided: any) => ({
      ...provided,
      color: theme === "dark" ? "#f4f4f5" : "#333",
    }),
    menu: (provided: any) => ({
      ...provided,
      backgroundColor: theme === "dark" ? "#3f3f3f" : "#fff",
      color: theme === "dark" ? "#f4f4f5" : "#333",
    }),
    option: (provided: any, state: any) => ({
      ...provided,
      backgroundColor: state.isFocused
        ? theme === "dark"
          ? "#505050"
          : "#eee"
        : theme === "dark"
        ? "#3f3f3f"
        : "#fff",
      color: theme === "dark" ? "#f4f4f5" : "#333",
      "&:hover": {
        backgroundColor: theme === "dark" ? "#505050" : "#eee",
        color: theme === "dark" ? "#f4f4f5" : "#333",
      },
    }),
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, show: false });
  };

  const handlePaymentSubmission = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    if (!stripe || !elements) {
      console.error("Stripe.js has not loaded yet.");
      setSnackbar({
        show: true,
        message: "Stripe.js is not loaded. Please try again.",
        type: "error",
      });
      return;
    }

    try {
      const result = await stripe.confirmPayment({
        elements,
        confirmParams: {},
        redirect: "if_required",
      });

      if (result.error) {
        console.log(result.error.message);
        setSnackbar({
          show: true,
          message: result.error.message || "An error occurred during payment.",
          type: "error",
        });
      } else if (result.paymentIntent?.status === "succeeded") {
        console.log("Payment succeeded!");
        setPaymentSuccess(true);
        setPaymentStatus("success");
        const activationDate = new Date();
        const expirationDate = new Date(activationDate);
        expirationDate.setFullYear(expirationDate.getFullYear() + 1);
        setMembershipActivationDate(activationDate);
        setMembershipExpirationDate(expirationDate);
        setSnackbar({
          show: true,
          message: "Payment successful! Now you can submit your membership!",
          type: "success",
        });
        setIsPaymentModalOpen(false);
      } else {
        console.error("Unexpected payment result:", result);
        setSnackbar({
          show: true,
          message: "Unexpected payment result. Please try again.",
          type: "error",
        });
      }
    } catch (error) {
      console.error("Payment failed", error);
      setSnackbar({
        show: true,
        message: "Payment failed. Please try again.",
        type: "error",
      });
    }
  };

  const Dropdown = React.forwardRef<HTMLSelectElement, DropdownProps>(
    ({ value, onChange, children, ...props }, ref): JSX.Element => {
      return (
        <select
          ref={ref}
          value={value as string}
          onChange={onChange}
          className="w-full bg-white border border-gray-300 text-black p-2 rounded-md cursor-pointer outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary appearance-none"
          {...props}
        >
          {children}
        </select>
      );
    }
  );

  Dropdown.displayName = "Dropdown";

  const components: CustomComponents = {
    Dropdown: Dropdown as CustomComponents["Dropdown"],
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white dark:bg-black dark:bg-dot-white/[0.2] bg-dot-black/[0.2]">
      <ModalSpinner isVisible={isLoadingModal} />

      <div className="max-w-md w-full mx-auto rounded-lg bg-white dark:bg-black p-8 dark:bg-dot-white/[0.2] bg-dot-black/[0.2]">
        <div className="flex justify-center mb-6">
          <Image
            src="/eljardinlogo.JPG"
            alt="El Jardin Logo"
            width={64}
            height={64}
          />
        </div>
        <h3 className="font-bold text-3xl text-center text-neutral-800 dark:text-neutral-200 pb-6">
          Welcome to El Jardin Verde!
        </h3>
        <p className="text-neutral-600 text-sm max-w-sm mt-2 dark:text-neutral-300">
          Please fill in the form below for official registration to our club!
        </p>

        {MembershipPaymentModal()}

        <form className="my-8" onSubmit={formik.handleSubmit}>
          <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-2 mb-4">
            <LabelInputContainer>
              <Label htmlFor="firstname">First name</Label>
              <Input
                id="firstname"
                placeholder="ex: Tyler"
                type="text"
                {...formik.getFieldProps("firstname")}
              />
              {formik.touched.firstname && formik.errors.firstname ? (
                <div className="text-red-600">{formik.errors.firstname}</div>
              ) : null}
            </LabelInputContainer>
            <LabelInputContainer>
              <Label htmlFor="lastname">Last name</Label>
              <Input
                id="lastname"
                placeholder="ex: Durden"
                type="text"
                {...formik.getFieldProps("lastname")}
              />
              {formik.touched.lastname && formik.errors.lastname ? (
                <div className="text-red-600">{formik.errors.lastname}</div>
              ) : null}
            </LabelInputContainer>
          </div>

          <LabelInputContainer className="mb-4">
            <Label htmlFor="dob">Date of Birth</Label>
            <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  onClick={() => setIsPopoverOpen(true)}
                  className={shadCn(
                    "w-full justify-start text-left font-normal",
                    !dateOfBirth && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateOfBirth ? (
                    format(dateOfBirth, "PPP")
                  ) : (
                    <span>Pick a date</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[calc(100vw-0.5rem)] sm:w-auto p-2 mx-1 my-1 mobile-calendar-popover">
                <Calendar
                  mode="single"
                  selected={dateOfBirth || undefined}
                  onSelect={handleDateSelect}
                  disabled={(date) =>
                    date > new Date() || date < new Date("1900-01-01")
                  }
                  initialFocus
                  captionLayout="dropdown-buttons"
                  fromYear={1900}
                  toYear={new Date().getFullYear()}
                  className="rounded-md border w-full sm:w-[400px] p-2"
                  classNames={{
                    months:
                      "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
                    month: "space-y-4",
                    caption:
                      "flex flex-col space-y-2 pb-4 pt-2 px-2 relative text-black",
                    caption_label: "text-sm font-medium text-black",
                    nav: "space-x-1 flex items-center",
                    nav_button:
                      "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 text-white",
                    nav_button_previous: "absolute left-2 top-2",
                    nav_button_next: "absolute right-2 top-2",
                    table: "w-full border-collapse space-y-1",
                    head_row: "flex w-full",
                    head_cell:
                      "text-muted-foreground rounded-md w-full font-normal text-[0.8rem]",
                    row: "flex w-full mt-2",
                    cell: "text-center text-sm p-0 relative [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20 w-full",
                    day: "h-9 w-9 p-0 font-normal aria-selected:opacity-100",
                    day_selected:
                      "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
                    day_today: "bg-accent text-accent-foreground",
                    day_outside: "text-muted-foreground opacity-50",
                    day_disabled: "text-muted-foreground opacity-50",
                    day_range_middle:
                      "aria-selected:bg-accent aria-selected:text-accent-foreground",
                    day_hidden: "invisible",
                    caption_dropdowns: "flex flex-col space-y-2",
                    dropdown:
                      "bg-white border border-gray-300 text-black p-2 rounded-md cursor-pointer outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary",
                    dropdown_month: "w-full",
                    dropdown_year: "w-full",
                    dropdown_icon:
                      "absolute right-2 top-1/2 transform -translate-y-1/2",
                  }}
                  components={components}
                />
              </PopoverContent>
            </Popover>
            {formik.touched.dob && formik.errors.dob ? (
              <div className="text-red-600">{formik.errors.dob}</div>
            ) : null}
          </LabelInputContainer>

          <LabelInputContainer className="mb-4">
            <Label htmlFor="placeOfBirth">Place of Birth</Label>
            <Input
              id="placeOfBirth"
              placeholder="ex London"
              type="text"
              {...formik.getFieldProps("placeOfBirth")}
            />
            {formik.touched.placeOfBirth && formik.errors.placeOfBirth ? (
              <div className="text-red-600">{formik.errors.placeOfBirth}</div>
            ) : null}
          </LabelInputContainer>

          <LabelInputContainer className="mb-4">
            <Label htmlFor="countryOfResidence">Country of Residence</Label>
            <Select
              options={options}
              value={country}
              onChange={handleCountryChange}
              styles={customStyles}
              className="w-full"
            />
            {formik.touched.countryOfResidence &&
            formik.errors.countryOfResidence ? (
              <div className="text-red-600">
                {formik.errors.countryOfResidence}
              </div>
            ) : null}
          </LabelInputContainer>

          {isSpainSelected && (
            <LabelInputContainer className="mb-4">
              <div className="flex items-center">
                <input
                  id="tenerifeResident"
                  type="checkbox"
                  checked={isTenerifeResident}
                  onChange={() => setIsTenerifeResident(!isTenerifeResident)}
                  className="mr-2 w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                />
                <Label htmlFor="tenerifeResident">
                  If you are a resident of Tenerife, please check this box!
                </Label>
              </div>
            </LabelInputContainer>
          )}

          <LabelInputContainer className="mb-4">
            <Label htmlFor="formOfIdentification">Form of Identification</Label>
            <div className="relative p-[2px] rounded-lg group/input">
              <select
                id="formOfIdentification"
                className="w-full h-10 px-3 py-2 border-none rounded-md bg-gray-50 dark:bg-zinc-800 text-black dark:text-white shadow-input focus:outline-none focus:ring-2 focus:ring-neutral-400 dark:focus:ring-neutral-600"
                {...formik.getFieldProps("formOfIdentification")}
              >
                <option value="">Select an option</option>
                <option value="ID">ID</option>
                <option value="Passport">Passport</option>
                <option value="Driver Licence">Driver Licence</option>
              </select>
            </div>
            {formik.touched.formOfIdentification &&
            formik.errors.formOfIdentification ? (
              <div className="text-red-600">
                {formik.errors.formOfIdentification}
              </div>
            ) : null}
          </LabelInputContainer>

          <LabelInputContainer className="mb-4">
            <Label htmlFor="club">Select Club</Label>
            <div className="relative p-[2px] rounded-lg group/input">
              <select
                id="club"
                className="w-full h-10 px-3 py-2 border-none rounded-md bg-gray-50 dark:bg-zinc-800 text-black dark:text-white shadow-input focus:outline-none focus:ring-2 focus:ring-neutral-400 dark:focus:ring-neutral-600"
                {...formik.getFieldProps("club")}
              >
                <option value="">Select an option</option>
                <option value="El Jardin Verde">El Jardin Verde</option>
              </select>
            </div>
            {formik.touched.club && formik.errors.club ? (
              <div className="text-red-600">{formik.errors.club}</div>
            ) : null}
          </LabelInputContainer>

          <div>
            <LabelInputContainer className="mb-4">
              <Label htmlFor="uploadPhoto">Upload a Photo of You with ID</Label>
              <div className="relative p-[2px] rounded-lg group/input">
                <Button onClick={handleOpenModal} type="button">
                  {photoStatus || "Take a photo or upload a file"}
                </Button>
              </div>
              {formik.touched.uploadPhoto && formik.errors.uploadPhoto ? (
                <div className="text-red-600">{formik.errors.uploadPhoto}</div>
              ) : null}
            </LabelInputContainer>

            {isModalOpen && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white p-8 rounded-lg shadow-lg">
                  <h3 className="text-lg font-medium text-gray-800 mb-4">
                    Choose an option
                  </h3>
                  <Button
                    onClick={() => {
                      setIsCameraOpen(true);
                      handleCloseModal();
                    }}
                    className="w-full mb-4"
                  >
                    Capture Photo
                  </Button>
                  <Button
                    onClick={() => {
                      fileInputRef.current?.click();
                      handleCloseModal();
                    }}
                    className="w-full"
                  >
                    Upload from Device
                  </Button>
                  <Button onClick={handleCloseModal} className="w-full mt-4">
                    Cancel
                  </Button>
                </div>
              </div>
            )}

            <Input
              id="uploadPhoto"
              type="file"
              accept="image/*"
              className="hidden"
              ref={fileInputRef}
              onChange={handleFileUpload}
            />

            {isCameraOpen && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white p-8 rounded-lg shadow-lg">
                  <Webcam
                    audio={false}
                    ref={webcamRef}
                    screenshotFormat="image/jpeg"
                    videoConstraints={{ facingMode: "user" }}
                  />
                  <Button onClick={handleCapturePhoto} className="mt-4 w-full">
                    Capture Photo
                  </Button>
                  <Button
                    onClick={() => setIsCameraOpen(false)}
                    className="mt-4 w-full"
                  >
                    Close Camera
                  </Button>
                </div>
              </div>
            )}
          </div>

          <div>
            <LabelInputContainer className="mb-4">
              <Label htmlFor="uploadIDPhoto">Upload or Capture ID Photo</Label>
              <div className="relative p-[2px] rounded-lg group/input">
                <Button onClick={() => setIsIDModalOpen(true)} type="button">
                  {idPhotoStatus || "Take a photo or upload a file"}
                </Button>
              </div>
              {formik.touched.uploadIDPhoto && formik.errors.uploadIDPhoto ? (
                <div className="text-red-600">
                  {formik.errors.uploadIDPhoto}
                </div>
              ) : null}
            </LabelInputContainer>

            {isIDModalOpen && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white p-8 rounded-lg shadow-lg">
                  <h3 className="text-lg font-medium text-gray-800 mb-4">
                    Choose an option
                  </h3>
                  <Button
                    onClick={() => {
                      setIsIDCameraOpen(true);
                      setIsIDModalOpen(false);
                    }}
                    className="w-full mb-4"
                  >
                    Capture ID Photo
                  </Button>
                  <Button
                    onClick={() => {
                      fileInputRef.current?.click();
                      setIsIDModalOpen(false);
                    }}
                    className="w-full"
                  >
                    Upload from Device
                  </Button>
                  <Button
                    onClick={() => setIsIDModalOpen(false)}
                    className="w-full mt-4"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}

            <Input
              id="uploadIDPhoto"
              type="file"
              accept="image/*"
              className="hidden"
              ref={fileInputRef}
              onChange={handleIDFileUpload}
            />

            {isIDCameraOpen && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white p-8 rounded-lg shadow-lg">
                  <Webcam
                    audio={false}
                    ref={webcamRef}
                    screenshotFormat="image/jpeg"
                    videoConstraints={{ facingMode: { exact: "environment" } }}
                  />
                  <Button
                    onClick={handleIDCapturePhoto}
                    className="mt-4 w-full"
                  >
                    Capture ID Photo
                  </Button>
                  <Button
                    onClick={() => setIsIDCameraOpen(false)}
                    className="mt-4 w-full"
                  >
                    Close Camera
                  </Button>
                </div>
              </div>
            )}
          </div>

          <LabelInputContainer className="mb-4">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              placeholder="Your email address"
              type="email"
              {...formik.getFieldProps("email")}
            />
            {formik.touched.email && formik.errors.email ? (
              <div className="text-red-600">{formik.errors.email}</div>
            ) : null}
          </LabelInputContainer>
          <LabelInputContainer className="mb-4">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              placeholder="••••••••"
              type="password"
              {...formik.getFieldProps("password")}
            />
            {formik.touched.password && formik.errors.password ? (
              <div className="text-red-600">{formik.errors.password}</div>
            ) : null}
          </LabelInputContainer>
          <LabelInputContainer className="mb-4">
            <Label htmlFor="retypePassword">Retype Password</Label>
            <Input
              id="retypePassword"
              placeholder="••••••••"
              type="password"
              {...formik.getFieldProps("retypePassword")}
            />
            {formik.touched.retypePassword && formik.errors.retypePassword ? (
              <div className="text-red-600">{formik.errors.retypePassword}</div>
            ) : null}
          </LabelInputContainer>

          {!isTenerifeResident && (
            <LabelInputContainer className="mb-4">
              <Button onClick={() => setIsPaymentModalOpen(true)} type="button">
                Select Membership and Pay
              </Button>
              {membership && (
                <div
                  className={`${
                    paymentStatus === "success"
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  Membership Selected: {membership}
                  {paymentStatus === "success" &&
                    " - Payment Successful! Please do not hit the back button or refresh the page. Hit the Sign Up button!"}
                  {paymentStatus === "failed" &&
                    " - Payment Failed. Please try again."}
                </div>
              )}
            </LabelInputContainer>
          )}

          <LabelInputContainer className="mb-8 mt-8">
            <div className="flex items-center">
              <input
                id="termsAccepted"
                type="checkbox"
                checked={termsAccepted}
                onChange={() => setTermsAccepted(!termsAccepted)}
                className="mr-2 w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
              />
              <Label htmlFor="termsAccepted">
                I agree to the{" "}
                <a
                  href="/terms"
                  className="text-blue-600 underline"
                  target="_blank"
                >
                  Terms and Conditions
                </a>{" "}
                and{" "}
                <a
                  href="/privacy"
                  className="text-blue-600 underline"
                  target="_blank"
                >
                  Privacy Policy
                </a>
                .
              </Label>
            </div>
          </LabelInputContainer>

          <button
            className={`bg-gradient-to-br from-black to-neutral-600 block w-full text-white rounded-md h-10 font-medium shadow-md ${
              (!isTenerifeResident && paymentStatus !== "success") ||
              !termsAccepted
                ? "opacity-50 cursor-not-allowed"
                : ""
            }`}
            type="submit"
            disabled={
              (!isTenerifeResident && paymentStatus !== "success") ||
              !termsAccepted
            }
          >
            Sign up &rarr;
          </button>

          <button
            className="mt-8 bg-gradient-to-br relative group/btn from-black dark:from-zinc-900 dark:to-zinc-900 to-neutral-600 block dark:bg-zinc-800 w-full text-white rounded-md h-10 font-medium shadow-[0px_1px_0px_0px_#ffffff40_inset,0px_-1px_0px_0px_#ffffff40_inset] dark:shadow-[0px_1px_0px_0px_var(--zinc-800)_inset,0px_-1px_0px_0px_var(--zinc-800)_inset]"
            type="button"
            onClick={handleBackClick}
          >
            Back &larr;
            <BottomGradient />
          </button>

          <div className="bg-gradient-to-r from-transparent via-neutral-300 dark:via-neutral-700 to-transparent my-8 h-[1px] w-full" />

          <div className="text-center mt-4">
            <p className="text-neutral-600 dark:text-neutral-300">
              Already a user?{" "}
              <a
                href="/login"
                className="text-blue-600 dark:text-blue-400 underline"
              >
                Click here to login!
              </a>
            </p>
          </div>
        </form>

        <Snackbar
          message={snackbar.message}
          type={snackbar.type}
          show={snackbar.show}
          onClose={handleCloseSnackbar}
        />
      </div>
    </div>
  );
}

const BottomGradient = () => {
  return (
    <>
      <span className="group-hover/btn:opacity-100 block transition duration-500 opacity-0 absolute h-px w-full -bottom-px inset-x-0 bg-gradient-to-r from-transparent via-cyan-500 to-transparent" />
      <span className="group-hover/btn:opacity-100 blur-sm block transition duration-500 opacity-0 absolute h-px w-1/2 mx-auto -bottom-px inset-x-10 bg-gradient-to-r from-transparent via-indigo-500 to-transparent" />
    </>
  );
};

const LabelInputContainer = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <div className={aceternityCn("flex flex-col space-y-2 w-full", className)}>
      {children}
    </div>
  );
};

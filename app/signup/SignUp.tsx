// SignUp.tsx
"use client";
import dynamic from "next/dynamic";
import React, { useState, useRef, useCallback } from "react";
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

const Select = dynamic(() => import("react-select"), { ssr: false });
const MobileDatePicker = dynamic(() => import("react-mobile-datepicker"), {
  ssr: false,
});

const isOver21 = (dob: Date | null) => {
  if (!dob) return false;
  const today = new Date();
  const age = today.getFullYear() - dob.getFullYear();
  const monthDiff = today.getMonth() - dob.getMonth();
  const dayDiff = today.getDate() - dob.getDate();
  return (
    age > 21 ||
    (age === 21 && (monthDiff > 0 || (monthDiff === 0 && dayDiff >= 0)))
  );
};

export function SignUp() {
  const { theme } = useTheme();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
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

  const options = countryList().getData();

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleDateSelect = (date: React.SetStateAction<Date | null>) => {
    setDateOfBirth(date);
    formik.setFieldValue("dob", date);
    setIsDatePickerOpen(false);
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
      uploadPhoto: null as File | string | null,
      email: "",
      password: "",
      retypePassword: "",
    },
    validationSchema: Yup.object({
      firstname: Yup.string().required("First name is required"),
      lastname: Yup.string().required("Last name is required"),
      dob: Yup.date().required("Date of birth is required").nullable(),
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
      email: Yup.string()
        .email("Invalid email address")
        .required("Email is required"),
      password: Yup.string()
        .required("Password is required")
        .min(8, "Password must be at least 8 characters"),
      retypePassword: Yup.string()
        .required("Retype your password")
        .oneOf([Yup.ref("password")], "Passwords must match"),
    }),
    onSubmit: async (values) => {
      if (!isOver21(values.dob)) {
        setSnackbar({
          show: true,
          message: "You must be over 21 years old to register.",
          type: "error",
        });
        return;
      }

      try {
        const hashedPassword = await bcrypt.hash(values.password, 10);
        const userCredential = await createUserWithEmailAndPassword(
          auth,
          values.email,
          values.password
        );
        const user = userCredential.user;

        let photoURL = "";
        if (values.uploadPhoto) {
          const storageRef = ref(storage, `user_photos/${user.uid}`);
          if (typeof values.uploadPhoto === "string") {
            const response = await fetch(values.uploadPhoto);
            const blob = await response.blob();
            await uploadBytes(storageRef, blob);
          } else {
            await uploadBytes(storageRef, values.uploadPhoto);
          }
          photoURL = await getDownloadURL(storageRef);
        }

        await addDoc(collection(db, "users"), {
          uid: user.uid,
          firstName: values.firstname,
          lastName: values.lastname,
          dob: values.dob,
          placeOfBirth: values.placeOfBirth,
          country: values.countryOfResidence?.label || "",
          identification: values.formOfIdentification,
          email: values.email,
          photo: photoURL,
          password: hashedPassword,
        });

        setSnackbar({
          show: true,
          message:
            "Registration completed! Redirecting to login page. Please wait",
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
            message: "User was not created! Database error! Please try again",
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

  const handleBackClick = () => {
    router.push("/");
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

  return (
    <div className="max-w-md w-full mx-auto mt-12 items-center rounded-none md:rounded-2xl p-4 md:p-8 shadow-input bg-white dark:bg-black dark:bg-dot-white/[0.2] bg-dot-black/[0.2]">
      <h3 className="font-bold text-3xl text-center text-neutral-800 dark:text-neutral-200 pb-6">
        Welcome to ElJardinVerde!
      </h3>
      <p className="text-neutral-600 text-sm max-w-sm mt-2 dark:text-neutral-300">
        Please fill in the form below for official registration to our club!
      </p>

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
          <Input
            id="dob"
            placeholder="Click to select your date of birth"
            value={dateOfBirth ? dateOfBirth.toLocaleDateString() : ""}
            onClick={() => setIsDatePickerOpen(true)}
            readOnly
            className="cursor-pointer"
          />
          <MobileDatePicker
            isOpen={isDatePickerOpen}
            onSelect={handleDateSelect}
            onCancel={() => setIsDatePickerOpen(false)}
            max={new Date()}
            theme="ios"
            confirmText="OK"
            cancelText="Cancel"
            headerFormat="YYYY-MM-DD"
            dateFormat={["YYYY", "MM", "DD"]}
          />
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
            onChange={(selectedOption) => {
              setCountry(selectedOption);
              formik.setFieldValue("countryOfResidence", selectedOption);
            }}
            styles={customStyles}
            className="w-full"
            classNamePrefix="select"
          />
          {formik.touched.countryOfResidence &&
          formik.errors.countryOfResidence ? (
            <div className="text-red-600">
              {formik.errors.countryOfResidence}
            </div>
          ) : null}
        </LabelInputContainer>
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

        <button
          className="bg-gradient-to-br relative group/btn from-black dark:from-zinc-900 dark:to-zinc-900 to-neutral-600 block dark:bg-zinc-800 w-full text-white rounded-md h-10 font-medium shadow-[0px_1px_0px_0px_#ffffff40_inset,0px_-1px_0px_0px_#ffffff40_inset] dark:shadow-[0px_1px_0px_0px_var(--zinc-800)_inset,0px_-1px_0px_0px_var(--zinc-800)_inset]"
          type="submit"
        >
          Sign up &rarr;
          <BottomGradient />
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
      />
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

"use client";

import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useFormik } from "formik";
import * as Yup from "yup";
import { collection, addDoc } from "firebase/firestore";
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
} from "firebase/auth";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { auth, db, storage } from "../api/firebaseConfig";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Button } from "@/components/ui/button";
import { Snackbar } from "../components/Snackbar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Camera } from "lucide-react";
import countryList from "react-select-country-list";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import Webcam from "react-webcam";
import { signOut } from "firebase/auth";

interface FormValues {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  club: string;
  country: string;
  dob: string;
  identification: string;
  identificationType: string;
  membershipType: string;
  placeOfBirth: string;
  selfie: string;
  idPhoto: string;
}

export default function AdminPage() {
  const router = useRouter();
  const [snackbar, setSnackbar] = useState<{
    show: boolean;
    message: string;
    type: "success" | "error";
  }>({ show: false, message: "", type: "success" });
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [isStreamActive, setIsStreamActive] = useState(false);
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const webcamRef = useRef<Webcam>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [selectedClub, setSelectedClub] = useState("");
  const [selectedCountry, setSelectedCountry] = useState("");
  const [selectedMembershipType, setSelectedMembershipType] = useState("");
  const [selectedIdentificationTypes, setSelectedIdentificationTypes] =
    useState("");
  const [capturedIDPhoto, setCapturedIDPhoto] = useState<string | null>(null);
  const [isIDCameraOpen, setIsIDCameraOpen] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        const allowedAdminEmails = [
          "iulianpampu@icloud.com",
          "alexnemes23@yahoo.com",
          "dahmadrian1@gmail.com",
          "gabiro_albu@yahoo.com",
          "eljardinverde.clubsocial@yahoo.com",
        ];
        if (!allowedAdminEmails.includes(user.email || "")) {
          router.push("/");
        }
      } else {
        router.push("/");
      }
    });
    return () => unsubscribe();
  }, [router]);

  useEffect(() => {
    if (snackbar.show) {
      const timer = setTimeout(() => {
        setSnackbar({ ...snackbar, show: false });
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [snackbar]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push("/login");
    } catch (error) {
      console.error("Error signing out: ", error);
      setSnackbar({
        show: true,
        message: "Error signing out. Please try again.",
        type: "error",
      });
    }
  };
  const clubOptions = [{ value: "El Jardin Verde", label: "El Jardin Verde" }];

  const membershipOptions = [
    { value: "Regular member", label: "Regular member - 25 Euro" },
    { value: "VIP Membership", label: "VIP Membership - 50 Euro" },
  ];

  const identificationTypes = [
    { value: "ID", label: "ID" },
    { value: "Passport", label: "Passport" },
    { value: "Drivers License", label: "Driver's License" },
  ];

  const countries = countryList().getData();

  const formik = useFormik<FormValues>({
    initialValues: {
      email: "",
      password: "",
      firstName: "",
      lastName: "",
      club: "",
      country: "",
      dob: "",
      identification: "",
      identificationType: "",
      membershipType: "",
      placeOfBirth: "",
      selfie: "",
      idPhoto: "",
    },

    validationSchema: Yup.object({
      email: Yup.string().email("Invalid email address").required("Required"),
      password: Yup.string()
        .min(8, "Must be at least 8 characters")
        .required("Required"),
      firstName: Yup.string().required("Required"),
      lastName: Yup.string().required("Required"),
      club: Yup.string().required("Required"),
      country: Yup.string().required("Required"),
      dob: Yup.date().required("Date of birth is required"),
      identification: Yup.string().required("Required"),
      identificationType: Yup.string().required("Required"),
      membershipType: Yup.string().required("Required"),
      placeOfBirth: Yup.string().required("Required"),
      selfie: Yup.string().required("Selfie is required"),
      idPhoto: Yup.string().required("ID Photo is required"),
    }),
    onSubmit: async (values) => {
      try {
        const userCredential = await createUserWithEmailAndPassword(
          auth,
          values.email,
          values.password
        );
        const user = userCredential.user;

        let photoURL = "";
        let idPhotoURL = "";

        if (values.selfie) {
          const imageRef = ref(storage, `userPhotos/${user.uid}-selfie`);
          const response = await fetch(values.selfie);
          const blob = await response.blob();
          await uploadBytes(imageRef, blob);
          photoURL = await getDownloadURL(imageRef);
        }

        if (values.idPhoto) {
          const idPhotoRef = ref(storage, `userIDPhotos/${user.uid}-id`);
          const idResponse = await fetch(values.idPhoto);
          const idBlob = await idResponse.blob();
          await uploadBytes(idPhotoRef, idBlob);
          idPhotoURL = await getDownloadURL(idPhotoRef);
        }

        await addDoc(collection(db, "users"), {
          uid: user.uid,
          email: values.email,
          firstName: values.firstName,
          firstNameLower: values.firstName.toLowerCase(),
          lastName: values.lastName,
          club: values.club,
          country: values.country,
          dob: new Date(values.dob),
          identification: values.identification,
          identificationType: values.identificationType,
          membershipType: values.membershipType,
          placeOfBirth: values.placeOfBirth,
          membershipActivationDate: new Date(),
          membershipExpirationDate: new Date(
            new Date().setFullYear(new Date().getFullYear() + 1)
          ),
          isAdmin: false,
          photo: photoURL,
          idPhoto: idPhotoURL,
          paymentMethod: "cash",
        });

        setSnackbar({
          show: true,
          message: "User added successfully!",
          type: "success",
        });
        formik.resetForm();
        setCapturedImage(null);
        setCapturedIDPhoto(null);
      } catch (error) {
        console.error("Error adding new user:", error);
        setSnackbar({
          show: true,
          message: "Error adding user. Please try again.",
          type: "error",
        });
      }
    },
  });

  const startIDCamera = () => {
    setIsIDCameraOpen(true);
  };

  const handleCloseIDCamera = () => {
    setIsIDCameraOpen(false);
  };

  const captureIDPhoto = () => {
    if (webcamRef.current) {
      const imageSrc = webcamRef.current.getScreenshot();
      setCapturedIDPhoto(imageSrc);
      formik.setFieldValue("idPhoto", imageSrc);
      setIsStreamActive(false);
    }
  };

  const handleSaveIDPhoto = () => {
    if (capturedIDPhoto) {
      formik.setFieldValue("idPhoto", capturedIDPhoto);
      handleCloseIDCamera();
      setSnackbar({
        show: true,
        message: "ID Photo saved successfully",
        type: "success",
      });
    }
  };

  const startCamera = async () => {
    setIsCameraOpen(true);
  };

  const stopCamera = () => {
    setIsCameraOpen(false);
  };

  const capturePhoto = () => {
    if (webcamRef.current) {
      const imageSrc = webcamRef.current.getScreenshot();
      setCapturedImage(imageSrc);
      formik.setFieldValue("selfie", imageSrc);
      setIsCameraOpen(false);
    }
  };

  const handleSavePhoto = () => {
    if (capturedImage) {
      formik.setFieldValue("selfie", capturedImage);
      stopCamera();
      setSnackbar({
        show: true,
        message: "Photo saved successfully",
        type: "success",
      });
    }
  };

  const handleCloseCamera = () => {
    stopCamera();
  };

  useEffect(() => {
    console.log('Formik values:', formik.values);
    console.log('Formik errors:', formik.errors);
  }, [formik.values, formik.errors]);
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-white dark:bg-black dark:bg-dot-white/[0.2] bg-dot-black/[0.2] p-4">
      <div className="w-full max-w-4xl mx-auto rounded-lg bg-white dark:bg-black p-8 dark:bg-dot-white/[0.2] bg-dot-black/[0.2] shadow-xl">
        <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-200 text-center mb-8">
          Add New User
        </h2>
        <form onSubmit={formik.handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  {...formik.getFieldProps("email")}
                />
                {formik.touched.email && formik.errors.email ? (
                  <div className="text-red-500">{formik.errors.email}</div>
                ) : null}
              </div>

              <div>
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  {...formik.getFieldProps("password")}
                />
                {formik.touched.password && formik.errors.password ? (
                  <div className="text-red-500">{formik.errors.password}</div>
                ) : null}
              </div>

              <div>
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  type="text"
                  {...formik.getFieldProps("firstName")}
                />
                {formik.touched.firstName && formik.errors.firstName ? (
                  <div className="text-red-500">{formik.errors.firstName}</div>
                ) : null}
              </div>

              <div>
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  type="text"
                  {...formik.getFieldProps("lastName")}
                />
                {formik.touched.lastName && formik.errors.lastName ? (
                  <div className="text-red-500">{formik.errors.lastName}</div>
                ) : null}
              </div>

              <div>
                <Label htmlFor="club">Club</Label>
                <Select
                  onValueChange={(value) => {
                    formik.setFieldValue("club", value);
                    setSelectedClub(value);
                  }}
                  value={selectedClub}
                >
                  <SelectTrigger className="bg-slate-300">
                    <SelectValue placeholder="Select a club" />
                  </SelectTrigger>
                  <SelectContent>
                    {clubOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {formik.touched.club && formik.errors.club ? (
                  <div className="text-red-500">{formik.errors.club}</div>
                ) : null}
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="country">Country</Label>
                <Select
                  onValueChange={(value) => {
                    formik.setFieldValue("country", value);
                    setSelectedCountry(value);
                  }}
                  value={selectedCountry}
                >
                  <SelectTrigger className="bg-slate-300">
                    <SelectValue placeholder="Select a country" />
                  </SelectTrigger>
                  <SelectContent>
                    {countries.map((country) => (
                      <SelectItem key={country.value} value={country.value}>
                        {country.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {formik.touched.country && formik.errors.country ? (
                  <div className="text-red-500">{formik.errors.country}</div>
                ) : null}
              </div>

              <div>
                <Label htmlFor="identificationTypes">Type of ID</Label>
                <Select
                  onValueChange={(value) => {
                    formik.setFieldValue("identificationType", value);
                    setSelectedIdentificationTypes(value);
                  }}
                  value={selectedIdentificationTypes}
                >
                  <SelectTrigger className="bg-slate-300">
                    <SelectValue placeholder="Select ID Type" />
                  </SelectTrigger>
                  <SelectContent>
                    {identificationTypes.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {formik.touched.identificationType &&
                formik.errors.identificationType ? (
                  <div className="text-red-500 bg-white">
                    {formik.errors.identificationType}
                  </div>
                ) : null}
              </div>

              <div>
                <Label htmlFor="dob">Date of Birth</Label>
                <Input id="dob" type="date" {...formik.getFieldProps("dob")} />
                {formik.touched.dob && formik.errors.dob ? (
                  <div className="text-red-500">{formik.errors.dob}</div>
                ) : null}
              </div>

              <div>
                <Label htmlFor="placeOfBirth">Place of Birth</Label>
                <Input
                  id="placeOfBirth"
                  type="text"
                  {...formik.getFieldProps("placeOfBirth")}
                />
                {formik.touched.placeOfBirth && formik.errors.placeOfBirth ? (
                  <div className="text-red-500">
                    {formik.errors.placeOfBirth}
                  </div>
                ) : null}
              </div>

              <div>
                <Label htmlFor="membershipType" className="mb-2 block">
                  Membership Type
                </Label>
                <Select
                  onValueChange={(value) => {
                    formik.setFieldValue("membershipType", value);
                    setSelectedMembershipType(value);
                  }}
                  value={selectedMembershipType}
                >
                  <SelectTrigger className="bg-slate-300">
                    <SelectValue placeholder="Select membership type" />
                  </SelectTrigger>
                  <SelectContent>
                    {membershipOptions.map((option) => (
                      <SelectItem
                        key={option.value}
                        value={option.value}
                        className={
                          selectedMembershipType === option.value
                            ? "bg-blue-100"
                            : ""
                        }
                      >
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {formik.touched.membershipType &&
                formik.errors.membershipType ? (
                  <div className="text-red-500 mt-2">
                    {formik.errors.membershipType}
                  </div>
                ) : null}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <Label htmlFor="identification">User selfie</Label>
              <div className="flex items-center space-x-2">
                <Button type="button" onClick={startCamera}>
                  <Camera className="w-4 h-4 mr-2" />
                  Camera
                </Button>
              </div>
              {formik.touched.selfie && formik.errors.selfie ? (
                <div className="text-red-500">{formik.errors.selfie}</div>
              ) : null}
            </div>

            {capturedImage && (
              <div>
                <img
                  src={capturedImage}
                  alt="Captured"
                  className="mt-2 max-w-full h-auto"
                />
              </div>
            )}

            <div className="space-y-4">
              <div>
                <Label htmlFor="identificationID">
                  Identification ID Photo
                </Label>
                <div className="flex items-center space-x-2">
                  <Button type="button" onClick={startIDCamera}>
                    <Camera className="w-4 h-4 mr-2" />
                    Capture ID
                  </Button>
                </div>
                {formik.touched.idPhoto && formik.errors.idPhoto ? (
                  <div className="text-red-500">{formik.errors.idPhoto}</div>
                ) : null}
              </div>

              {capturedIDPhoto && (
                <div>
                  <img
                    src={capturedIDPhoto}
                    alt="Captured ID"
                    className="mt-2 max-w-full h-auto"
                  />
                </div>
              )}
            </div>

            <Card>
              <CardContent>
                <p className="pt-4 text-center font-bold">
                  This Payment is made with cash!
                </p>
              </CardContent>
            </Card>

            <Button
              type="submit"
              className="w-full"
              disabled={!formik.isValid || formik.isSubmitting}
            >
              Add User
            </Button>
          </div>
        </form>

        <div className="mt-6 space-y-4">
          <Button
            onClick={() => router.push("/database")}
            className="w-full"
            variant="green"
          >
            Check Database
          </Button>

          <Button
            onClick={() => router.push("/")}
            className="w-full"
            variant="outline"
          >
            Back to Dashboard
          </Button>
          <Button
            className="w-full"
            onClick={handleLogout}
            variant="destructive"
          >
            Logout from admin
          </Button>
        </div>

        <Snackbar
          message={snackbar.message}
          type={snackbar.type}
          show={snackbar.show}
          onClose={() => setSnackbar({ ...snackbar, show: false })}
        />
      </div>

      <Dialog
        open={isCameraOpen}
        onOpenChange={(open) => {
          if (!open) handleCloseCamera();
          setIsCameraOpen(open);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Take ID Picture</DialogTitle>
          </DialogHeader>
          <div className="mt-4">
            {isCameraOpen && (
              <Webcam
                audio={false}
                ref={webcamRef}
                screenshotFormat="image/jpeg"
                videoConstraints={{ facingMode: { exact: "environment" } }}
              />
            )}
          </div>
          <DialogFooter className="sm:justify-start">
            {!capturedPhoto ? (
              <Button type="button" onClick={capturePhoto}>
                Take Picture
              </Button>
            ) : (
              <>
                <Button type="button" onClick={handleSavePhoto}>
                  Save
                </Button>
                <Button type="button" onClick={() => setCapturedPhoto(null)}>
                  Retake
                </Button>
              </>
            )}
            <Button type="button" onClick={handleCloseCamera}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={isIDCameraOpen}
        onOpenChange={(open) => {
          if (!open) handleCloseIDCamera();
          setIsIDCameraOpen(open);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Take ID Picture</DialogTitle>
          </DialogHeader>
          <div className="mt-4">
            {isIDCameraOpen && (
              <Webcam
                audio={false}
                ref={webcamRef}
                screenshotFormat="image/jpeg"
                videoConstraints={{ facingMode: { exact: "environment" } }}
              />
            )}
          </div>
          <DialogFooter className="sm:justify-start">
            {!capturedIDPhoto ? (
              <Button type="button" onClick={captureIDPhoto}>
                Take Picture
              </Button>
            ) : (
              <>
                <Button type="button" onClick={handleSaveIDPhoto}>
                  Save
                </Button>
                <Button type="button" onClick={() => setCapturedIDPhoto(null)}>
                  Retake
                </Button>
              </>
            )}
            <Button type="button" onClick={handleCloseIDCamera}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

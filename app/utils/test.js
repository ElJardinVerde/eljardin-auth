import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Platform,
  Image,
  Modal,
  Animated,
  Easing,
  Dimensions,
  KeyboardAvoidingView,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "./../src/context/ThemeContext";
import { router } from "expo-router";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth, db, storage } from "./../src/api/firebaseConfig";
import { collection, addDoc } from "firebase/firestore";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Picker } from "@react-native-picker/picker";
import { CameraView, useCameraPermissions, Camera } from "expo-camera";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import * as FileSystem from "expo-file-system";
import countryList from "country-list";
import NetInfo from "@react-native-community/netinfo";
import * as Crypto from "expo-crypto";
import { Ionicons } from "@expo/vector-icons";
import * as Font from "expo-font";

const { width, height } = Dimensions.get("window");

console.log("Camera module:", Camera);

const checkInternetConnection = async () => {
  const state = await NetInfo.fetch();
  return state.isConnected && state.isInternetReachable;
};

const validateEmail = (email) => {
  const re =
    /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(String(email).toLowerCase());
};

const checkPasswordStrength = (password) => {
  let strength = 0;
  if (password.length >= 8) strength++;
  if (password.match(/[a-z]+/)) strength++;
  if (password.match(/[A-Z]+/)) strength++;
  if (password.match(/[0-9]+/)) strength++;
  if (password.match(/[$@#&!]+/)) strength++;
  return strength;
};

export default function SignupScreen() {
  const hashPassword = async (password) => {
    const salt = await Crypto.getRandomBytesAsync(16);
    const saltHex = Buffer.from(salt).toString("hex");
    const hash = await Crypto.digestStringAsync(
      Crypto.CryptoDigestAlgorithm.SHA256,
      password + saltHex
    );
    return `${saltHex}:${hash}`;
  };

  const { theme } = useTheme();
  const isDarkMode = theme === "dark";
  const [showCountryPicker, setShowCountryPicker] = useState(false);
  const [showIDPicker, setShowIDPicker] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [fontLoaded, setFontLoaded] = useState(false);

  const [hasPermission, setHasPermission] = useState(null);
  const [type, setType] = useState(null);
  const [cameraType, setCameraType] = useState(null);

  const [image, setImage] = useState(null);
  const [tempImage, setTempImage] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [isCameraVisible, setIsCameraVisible] = useState(false);
  const [isImagePreviewVisible, setIsImagePreviewVisible] = useState(false);
  const [facing, setFacing] = useState("front");
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const countries = countryList.getData();

  const spinValue = useRef(new Animated.Value(0)).current;
  const scaleValue = useRef(new Animated.Value(0)).current;
  const fadeValue = useRef(new Animated.Value(1)).current;

  const [formData, setFormData] = useState({
    firstname: "",
    lastname: "",
    dob: new Date(),
    placeOfBirth: "",
    countryOfResidence: "Spain",
    formOfIdentification: "",
    email: "",
    password: "",
    retypePassword: "",
  });

  const [validations, setValidations] = useState({
    firstname: false,
    lastname: false,
    email: false,
    password: false,
    retypePassword: false,
  });

  useEffect(() => {
    const loadFonts = async () => {
      await Font.loadAsync({
        "SpaceMono-Regular": require("../../assets/fonts/SpaceMono-Regular.ttf"),
      });
      setFontLoaded(true);
    };
    loadFonts();
  }, []);

  useEffect(() => {
    if (isLoading) {
      Animated.loop(
        Animated.timing(spinValue, {
          toValue: 1,
          duration: 2000,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      ).start();
    } else {
      spinValue.setValue(0);
    }
  }, [isLoading]);

  useEffect(() => {
    if (showSuccessModal || showErrorModal) {
      Animated.parallel([
        Animated.spring(scaleValue, {
          toValue: 1,
          friction: 4,
          useNativeDriver: true,
        }),
        Animated.timing(fadeValue, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      scaleValue.setValue(0);
      fadeValue.setValue(0);
    }
  }, [showSuccessModal, showErrorModal]);

  useEffect(() => {
    Animated.timing(fadeValue, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();
  }, []);

  const handleTakeIDPicture = async () => {
    if (!permission?.granted) {
      const permissionResult = await requestPermission();
      if (!permissionResult.granted) {
        Alert.alert(
          "Camera Permission Required",
          "We need camera access to take a picture of your ID. Please grant permission in your device settings.",
          [{ text: "OK" }]
        );
        return;
      }
    }
    setIsCameraVisible(true);
  };

  const checkAge = (birthDate) => {
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age >= 21;
  };

  const onDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || formData.dob;
    setShowDatePicker(Platform.OS === "ios");
    if (Platform.OS === "android") {
      setShowDatePicker(false);
    }
    if (checkAge(currentDate)) {
      setFormData({ ...formData, dob: currentDate });
    } else {
      Alert.alert("Age Restriction", "You must be 21 years old to register.");
    }
  };

  const handleSignup = async () => {
    if (!(await checkInternetConnection())) {
      setErrorMessage(
        "No internet connection. Please check your network and try again."
      );
      setShowErrorModal(true);
      return;
    }

    if (
      !formData.firstname ||
      !formData.lastname ||
      !formData.email ||
      !formData.placeOfBirth ||
      !formData.countryOfResidence ||
      !formData.formOfIdentification ||
      !formData.password ||
      !formData.retypePassword ||
      !formData.dob
    ) {
      setErrorMessage(
        "All fields are required. Please fill in all the information."
      );
      setShowErrorModal(true);
      return;
    }

    if (!validateEmail(formData.email)) {
      setErrorMessage("Please enter a valid email address.");
      setShowErrorModal(true);
      return;
    }

    if (formData.password !== formData.retypePassword) {
      setErrorMessage("Passwords do not match. Please try again.");
      setShowErrorModal(true);
      return;
    }

    if (formData.password.length < 8) {
      setErrorMessage("Password must be at least 8 characters long.");
      setShowErrorModal(true);
      return;
    }

    if (!image) {
      setErrorMessage("Please take a picture with your ID before signing up.");
      setShowErrorModal(true);
      return;
    }

    setIsLoading(true);
    try {
      const hashedPassword = await hashPassword(formData.password);
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );
      const user = userCredential.user;
      let photoURL = "";

      const response = await fetch(image);
      const blob = await response.blob();
      const storageRef = ref(storage, `user_photos/${user.uid}`);
      await uploadBytes(storageRef, blob);
      photoURL = await getDownloadURL(storageRef);

      await addDoc(collection(db, "users"), {
        uid: user.uid,
        firstName: formData.firstname,
        lastName: formData.lastname,
        dob: formData.dob,
        placeOfBirth: formData.placeOfBirth,
        country: formData.countryOfResidence,
        identification: formData.formOfIdentification,
        email: formData.email,
        photo: photoURL,
        hashedPassword: hashedPassword,
      });

      setShowSuccessModal(true);
    } catch (error) {
      console.error("Signup failed:", error);
      if (!(await checkInternetConnection())) {
        setErrorMessage(
          "Lost internet connection. Please check your network and try again."
        );
      } else {
        setErrorMessage(
          error.message || "An unexpected error occurred. Please try again."
        );
      }
      setShowErrorModal(true);
    } finally {
      setIsLoading(false);
    }
  };

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  const takePicture = async () => {
    if (cameraRef.current) {
      try {
        const photo = await cameraRef.current.takePictureAsync({ quality: 1 });
        const localUri = FileSystem.documentDirectory + "temp_photo.jpg";
        await FileSystem.moveAsync({
          from: photo.uri,
          to: localUri,
        });
        setImage(localUri);
        setIsCameraVisible(false);
      } catch (error) {
        console.error("Error taking picture:", error);
        Alert.alert("Error", "Failed to take picture. Please try again.");
      }
    }
  };

  if (!permission) {
    return <View />;
  }
  const toggleCameraFacing = () => {
    setFacing((current) => (current === "back" ? "front" : "back"));
  };

  const confirmPhoto = () => {
    setImage(tempImage);
    setIsImagePreviewVisible(false);
  };

  const retakePhoto = () => {
    setTempImage(null);
    setIsImagePreviewVisible(false);
    setIsCameraVisible(true);
  };

  const renderInput = (
    placeholder,
    value,
    onChangeText,
    secureTextEntry = false,
    key
  ) => (
    <BlurView intensity={20} tint="light" style={styles.inputContainer}>
      <TextInput
        style={styles.input}
        placeholder={placeholder}
        placeholderTextColor="#A0AEC0"
        value={value}
        onChangeText={(text) => {
          onChangeText(text);
          if (key) {
            setValidations({
              ...validations,
              [key]:
                text.length > 0 && (key !== "email" || validateEmail(text)),
            });
          }
        }}
        secureTextEntry={secureTextEntry}
      />
      {key && validations[key] && (
        <Ionicons
          name="checkmark-circle"
          size={24}
          color="#4CAF50"
          style={styles.validationIcon}
        />
      )}
    </BlurView>
  );

  const renderPasswordStrengthMeter = () => {
    const strength = checkPasswordStrength(formData.password);
    const meterColor = ["#FF0000", "#FF4500", "#FFA500", "#9ACD32", "#008000"][
      strength - 1
    ];
    return (
      <View style={styles.passwordStrengthContainer}>
        <View
          style={[
            styles.passwordStrengthMeter,
            { width: `${strength * 20}%`, backgroundColor: meterColor },
          ]}
        />
        <Text style={styles.passwordStrengthText}>
          {
            ["Very Weak", "Weak", "Medium", "Strong", "Very Strong"][
              strength - 1
            ]
          }
        </Text>
      </View>
    );
  };

  if (!fontLoaded) {
    return null;
  }

  if (!permission.granted) {
    // Camera permissions are not granted yet
    return (
      <View style={styles.container}>
        <Text style={{ textAlign: "center" }}>
          We need your permission to show the camera
        </Text>
        <TouchableOpacity style={styles.button} onPress={requestPermission}>
          <Text style={styles.buttonText}>Grant permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <LinearGradient
      colors={["#4c669f", "#3b5998", "#192f6a"]}
      style={styles.gradientContainer}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.container}
      >
        <SafeAreaView style={styles.safeArea}>
          <ScrollView
            contentContainerStyle={styles.scrollViewContent}
            showsVerticalScrollIndicator={false}
          >
            <Animated.Text
              style={[styles.title, { opacity: fadeValue, opacity: 1 }]}
            >
              Join ElJardinVerde Club!
            </Animated.Text>

            {renderInput(
              "First Name",
              formData.firstname,
              (text) => setFormData({ ...formData, firstname: text }),
              false,
              "firstname"
            )}
            {renderInput(
              "Last Name",
              formData.lastname,
              (text) => setFormData({ ...formData, lastname: text }),
              false,
              "lastname"
            )}

            <TouchableOpacity
              onPress={() => setShowDatePicker(true)}
              style={styles.datePickerButton}
            >
              <Text style={styles.datePickerText}>
                Date of Birth: {formData.dob.toDateString()}
              </Text>
            </TouchableOpacity>

            {renderInput("Place of Birth", formData.placeOfBirth, (text) =>
              setFormData({ ...formData, placeOfBirth: text })
            )}

            <TouchableOpacity
              onPress={() => setShowCountryPicker(true)}
              style={styles.pickerButton}
            >
              <Text style={styles.pickerButtonText}>
                {formData.countryOfResidence || "Select Country of Residence"}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setShowIDPicker(true)}
              style={styles.pickerButton}
            >
              <Text style={styles.pickerButtonText}>
                {formData.formOfIdentification || "Select ID Type"}
              </Text>
            </TouchableOpacity>

            {renderInput(
              "Email",
              formData.email,
              (text) => setFormData({ ...formData, email: text }),
              false,
              "email"
            )}
            {renderInput(
              "Password",
              formData.password,
              (text) => setFormData({ ...formData, password: text }),
              true,
              "password"
            )}
            {renderPasswordStrengthMeter()}
            {renderInput(
              "Retype Password",
              formData.retypePassword,
              (text) => setFormData({ ...formData, retypePassword: text }),
              true,
              "retypePassword"
            )}

            <TouchableOpacity
              style={styles.button}
              onPress={handleTakeIDPicture}
            >
              <Text style={styles.buttonText}>Take ID Picture</Text>
            </TouchableOpacity>

            {image && (
              <Image source={{ uri: image }} style={styles.previewImage} />
            )}

            <TouchableOpacity
              style={styles.signupButton}
              onPress={handleSignup}
              disabled={isLoading}
            >
              <Text style={styles.signupButtonText}>
                {isLoading ? "Signing Up..." : "Sign Up"}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => router.back()}
              style={styles.backButton}
            >
              <Text style={styles.backButtonText}>
                Already have an account? Log In
              </Text>
            </TouchableOpacity>
          </ScrollView>

          {showDatePicker && (
            <Modal
              transparent={true}
              animationType="slide"
              visible={showDatePicker}
              onRequestClose={() => setShowDatePicker(false)}
            >
              <View style={styles.modalContainer}>
                <View style={styles.modalContent}>
                  <DateTimePicker
                    value={formData.dob}
                    mode="date"
                    display={Platform.OS === "ios" ? "spinner" : "default"}
                    onChange={onDateChange}
                    style={styles.datePicker}
                  />
                  <TouchableOpacity
                    style={styles.modalButton}
                    onPress={() => setShowDatePicker(false)}
                  >
                    <Text style={styles.modalButtonText}>Confirm</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </Modal>
          )}

          <Modal
            visible={showCountryPicker}
            animationType="slide"
            transparent={true}
          >
            <View style={styles.modalContainer}>
              <View style={styles.modalContent}>
                <Picker
                  selectedValue={formData.countryOfResidence}
                  onValueChange={(itemValue) => {
                    setFormData({ ...formData, countryOfResidence: itemValue });
                    setShowCountryPicker(false);
                  }}
                  style={styles.picker}
                >
                  {countries.map((country) => (
                    <Picker.Item
                      key={country.code}
                      label={country.name}
                      value={country.name}
                    />
                  ))}
                </Picker>
                <TouchableOpacity
                  style={styles.modalButton}
                  onPress={() => setShowCountryPicker(false)}
                >
                  <Text style={styles.modalButtonText}>Close</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>

          <Modal
            visible={showIDPicker}
            animationType="slide"
            transparent={true}
          >
            <View style={styles.modalContainer}>
              <View style={styles.modalContent}>
                <Picker
                  selectedValue={formData.formOfIdentification}
                  onValueChange={(itemValue) => {
                    setFormData({
                      ...formData,
                      formOfIdentification: itemValue,
                    });
                    setShowIDPicker(false);
                  }}
                  style={styles.picker}
                >
                  <Picker.Item label="Select ID Type" value="" />
                  <Picker.Item label="ID" value="ID" />
                  <Picker.Item label="Passport" value="Passport" />
                  <Picker.Item
                    label="Driver's License"
                    value="Driver's License"
                  />
                </Picker>
                <TouchableOpacity
                  style={styles.modalButton}
                  onPress={() => setShowIDPicker(false)}
                >
                  <Text style={styles.modalButtonText}>Close</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>

          {isCameraVisible && (
            <Modal visible={isCameraVisible} animationType="slide">
              <View style={styles.cameraContainer}>
                <CameraView
                  style={styles.camera}
                  facing={facing}
                  ref={cameraRef}
                >
                  <View style={styles.cameraControls}>
                    <TouchableOpacity
                      style={styles.cameraButton}
                      onPress={takePicture}
                    >
                      <Text style={styles.cameraButtonText}>Capture</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.cameraButton}
                      onPress={toggleCameraFacing}
                    >
                      <Text style={styles.cameraButtonText}>Flip</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.cameraButton}
                      onPress={() => setIsCameraVisible(false)}
                    >
                      <Text style={styles.cameraButtonText}>Close</Text>
                    </TouchableOpacity>
                  </View>
                </CameraView>
              </View>
            </Modal>
          )}

          {isImagePreviewVisible && (
            <Modal visible={isImagePreviewVisible} animationType="slide">
              <SafeAreaView style={styles.imagePreviewContainer}>
                <Image
                  source={{ uri: tempImage }}
                  style={styles.fullPreviewImage}
                />
                <View style={styles.previewControls}>
                  <TouchableOpacity
                    style={styles.previewButton}
                    onPress={retakePhoto}
                  >
                    <Text style={styles.previewButtonText}>Retake</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.previewButton}
                    onPress={confirmPhoto}
                  >
                    <Text style={styles.previewButtonText}>Keep Photo</Text>
                  </TouchableOpacity>
                </View>
              </SafeAreaView>
            </Modal>
          )}

          <Modal transparent={true} animationType="fade" visible={isLoading}>
            <View style={styles.modalBackground}>
              <View style={styles.activityIndicatorWrapper}>
                <Animated.View
                  style={[styles.spinner, { transform: [{ rotate: spin }] }]}
                />
                <Text style={styles.loadingText}>Creating your account...</Text>
              </View>
            </View>
          </Modal>

          <Modal
            transparent={true}
            animationType="fade"
            visible={showSuccessModal}
          >
            <View style={styles.modalBackground}>
              <Animated.View
                style={[
                  styles.modalContent,
                  { opacity: fadeValue, transform: [{ scale: scaleValue }] },
                ]}
              >
                <View style={[styles.iconCircle, styles.successCircle]}>
                  <Ionicons name="checkmark" size={50} color="#FFFFFF" />
                </View>
                <Text style={styles.modalTitle}>Success!</Text>
                <Text style={styles.modalText}>
                  Your account has been created successfully.
                </Text>
                <TouchableOpacity
                  style={styles.modalButton}
                  onPress={() => {
                    setShowSuccessModal(false);
                    router.replace("/");
                  }}
                >
                  <Text style={styles.modalButtonText}>Go to Login</Text>
                </TouchableOpacity>
              </Animated.View>
            </View>
          </Modal>

          <Modal
            transparent={true}
            animationType="fade"
            visible={showErrorModal}
          >
            <View style={styles.modalBackground}>
              <Animated.View
                style={[
                  styles.modalContent,
                  { opacity: fadeValue, transform: [{ scale: scaleValue }] },
                ]}
              >
                <View style={[styles.iconCircle, styles.errorCircle]}>
                  <Ionicons name="alert" size={50} color="#FFFFFF" />
                </View>
                <Text style={styles.modalTitle}>Oops!</Text>
                <Text style={styles.modalText}>
                  There was an error creating your account:
                </Text>
                <Text style={styles.errorText}>{errorMessage}</Text>
                <TouchableOpacity
                  style={styles.modalButton}
                  onPress={() => setShowErrorModal(false)}
                >
                  <Text style={styles.modalButtonText}>Try Again</Text>
                </TouchableOpacity>
              </Animated.View>
            </View>
          </Modal>
        </SafeAreaView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradientContainer: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  scrollViewContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 20,
  },
  title: {
    //fontFamily: 'Roboto-Bold',
    fontSize: 32,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 30,
    textAlign: "center",
  },
  inputContainer: {
    borderRadius: 25,
    marginBottom: 20,
    overflow: "hidden",
  },
  input: {
    //fontFamily: 'Roboto',
    paddingHorizontal: 20,
    paddingVertical: 15,
    fontSize: 16,
    color: "#FFFFFF",
  },
  validationIcon: {
    position: "absolute",
    right: 10,
    top: 15,
  },
  datePickerButton: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 25,
    paddingVertical: 15,
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  datePickerText: {
    //fontFamily: 'Roboto',
    color: "#FFFFFF",
    fontSize: 16,
  },
  pickerButton: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 25,
    paddingVertical: 15,
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  pickerButtonText: {
    //fontFamily: 'Roboto',
    color: "#FFFFFF",
    fontSize: 16,
  },
  button: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 25,
    paddingVertical: 15,
    alignItems: "center",
    marginTop: 20,
  },
  buttonText: {
    //fontFamily: 'Roboto-Bold',
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "bold",
  },
  signupButton: {
    backgroundColor: "#4CAF50",
    borderRadius: 25,
    paddingVertical: 15,
    alignItems: "center",
    marginTop: 30,
  },
  signupButtonText: {
    //fontFamily: 'Roboto-Bold',
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "bold",
  },
  backButton: {
    marginTop: 20,
    alignItems: "center",
  },
  backButtonText: {
    //fontFamily: 'Roboto',
    color: "#FFFFFF",
    fontSize: 16,
    textDecorationLine: "underline",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: "80%",
  },
  picker: {
    width: "100%",
  },
  modalButton: {
    backgroundColor: "#4CAF50",
    borderRadius: 25,
    paddingVertical: 15,
    alignItems: "center",
    marginTop: 20,
  },
  modalButtonText: {
    //fontFamily: 'Roboto-Bold',
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "bold",
  },
  cameraContainer: {
    flex: 1,
    backgroundColor: "#000000",
  },
  camera: {
    flex: 1,
  },
  cameraControls: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "flex-end",
    paddingBottom: 30,
    height: "100%",
  },
  cameraButton: {
    backgroundColor: "rgba(255, 255, 255, 0.5)",
    borderRadius: 30,
    padding: 15,
  },
  cameraButtonText: {
    //fontFamily: 'Roboto',
    color: "#FFFFFF",
    fontSize: 16,
  },
  imagePreviewContainer: {
    flex: 1,
    backgroundColor: "#000000",
    justifyContent: "center",
    alignItems: "center",
  },
  fullPreviewImage: {
    width: "100%",
    height: "80%",
    resizeMode: "contain",
  },
  previewControls: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
    position: "absolute",
    bottom: 30,
  },
  previewButton: {
    backgroundColor: "rgba(255, 255, 255, 0.5)",
    borderRadius: 25,
    paddingVertical: 15,
    paddingHorizontal: 30,
  },
  previewButtonText: {
    //fontFamily: 'Roboto-Bold',
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "bold",
  },
  previewImage: {
    width: 150,
    height: 150,
    borderRadius: 75,
    marginVertical: 20,
    alignSelf: "center",
  },
  modalBackground: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  activityIndicatorWrapper: {
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    padding: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  spinner: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 4,
    borderColor: "#4CAF50",
    borderTopColor: "transparent",
    marginBottom: 10,
  },
  loadingText: {
    //fontFamily: 'Roboto',
    marginTop: 10,
    fontSize: 16,
    fontWeight: "600",
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  successCircle: {
    backgroundColor: "#4CAF50",
  },
  errorCircle: {
    backgroundColor: "#F44336",
  },
  modalTitle: {
    //fontFamily: 'Roboto-Bold',
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
  },
  modalText: {
    //fontFamily: 'Roboto',
    fontSize: 16,
    textAlign: "center",
    marginBottom: 20,
  },
  errorText: {
    //fontFamily: 'Roboto',
    fontSize: 14,
    color: "#F44336",
    textAlign: "center",
    marginBottom: 20,
  },
  passwordStrengthContainer: {
    marginBottom: 20,
  },
  passwordStrengthMeter: {
    height: 5,
    borderRadius: 5,
    marginBottom: 5,
  },
  passwordStrengthText: {
    //fontFamily: 'Roboto',
    fontSize: 14,
    color: "#FFFFFF",
    textAlign: "center",
  },
  permissionContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  permissionText: {
    color: "#FFFFFF",
    fontSize: 18,
    textAlign: "center",
  },
});

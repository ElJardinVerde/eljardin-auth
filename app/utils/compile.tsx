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
} from "react-native";
import { useTheme } from "./../src/context/ThemeContext";
import { router } from "expo-router";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth, db, storage } from "./../src/api/firebaseConfig";
import { collection, addDoc } from "firebase/firestore";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Picker } from "@react-native-picker/picker";
import { SafeAreaView } from "react-native-safe-area-context";
import { CameraView, useCameraPermissions } from "expo-camera";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import * as FileSystem from "expo-file-system";
import countryList from "country-list";
import NetInfo from "@react-native-community/netinfo";
//import LottieView from "lottie-react-native";
import bcrypt from "react-native-bcrypt";
import * as Crypto from "expo-crypto";
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';

//const { width, height } = Dimensions.get('window');


export default function SignupScreen() {
  bcrypt.setRandomFallback((len) => {
    const buf = new Uint8Array(len);
    return buf.map(() =>
      Math.floor((Crypto.getRandomValues(new Uint8Array(1))[0] / 256) * 256)
    );
  });

  const { theme } = useTheme();
  const isDarkMode = theme === "dark";
  const [showCountryPicker, setShowCountryPicker] = useState(false);
  const [showIDPicker, setShowIDPicker] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  //const [showSuccessModal, setShowSuccessModal] = useState(false);

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

  const [image, setImage] = useState(null);
  const [tempImage, setTempImage] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [isCameraVisible, setIsCameraVisible] = useState(false);
  const [isImagePreviewVisible, setIsImagePreviewVisible] = useState(false);
  const [facing, setFacing] = useState("back");
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const spinValue = useRef(new Animated.Value(0)).current;
  const scaleValue = useRef(new Animated.Value(0)).current;
  const fadeValue = useRef(new Animated.Value(0)).current;

  const countries = countryList.getData();

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
    requestPermission();
  }, []);

  const checkInternetConnection = async () => {
    const state = await NetInfo.fetch();
    if (!state.isConnected) {
      Alert.alert(
        "No Internet Connection",
        "Please check your internet connection and try again."
      );
      return false;
    }
    return true;
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
    setShowDatePicker(Platform.OS === "ios"); // This should hide the picker on iOS automatically
    if (Platform.OS === "android") {
      setShowDatePicker(false); // Explicitly set to false on Android
    }
    if (checkAge(currentDate)) {
      setFormData({ ...formData, dob: currentDate });
    } else {
      Alert.alert("Age Restriction", "You must be 21 years old to register.");
    }
  };

  const handleSignup = async () => {
    console.log(formData);
    console.log("Current Image:", image);

    if (!(await checkInternetConnection())) {
      Alert.alert(
        "Error",
        "Please check your internet connection and try again."
      );
      return;
    }

    if (!image) {
      Alert.alert("Error", "Please upload an image.");
      return;
    }

    const {
      firstname,
      lastname,
      email,
      placeOfBirth,
      countryOfResidence,
      formOfIdentification,
      password,
      retypePassword,
      dob,
    } = formData;
    if (
      !firstname ||
      !lastname ||
      !email ||
      !placeOfBirth ||
      !countryOfResidence ||
      !formOfIdentification ||
      !password ||
      !retypePassword ||
      !dob
    ) {
      Alert.alert(
        "Error",
        "All fields are required. Please ensure all fields are filled."
      );
      return;
    }

    if (password !== retypePassword) {
      Alert.alert("Error", "Passwords do not match");
      return;
    }

    if (password.length < 8) {
      Alert.alert("Error", "Password must be at least 8 characters long");
      return;
    }

    setIsLoading(true);
    try {
      const hashedPassword = await new Promise((resolve, reject) => {
        bcrypt.hash(password, 10, (err, hash) => {
          if (err) reject(err);
          else resolve(hash);
        });
      });
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
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
        firstName: firstname,
        lastName: lastname,
        dob: dob,
        placeOfBirth: placeOfBirth,
        country: countryOfResidence,
        identification: formOfIdentification,
        email: email,
        photo: photoURL,
        hashedPassword: hashedPassword,
      });

      setShowSuccessModal(true);
    } catch (error) {
      console.error("Signup failed:", error);
      setErrorMessage(error.message);
      setShowErrorModal(true);
    } finally {
      setIsLoading(false);
    }
  };

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  const LoadingModal = () => (
    <Modal transparent={true} animationType="fade" visible={isLoading}>
      <View style={styles.modalBackground}>
        <View style={styles.activityIndicatorWrapper}>
          <Animated.View
            style={[styles.spinner, { transform: [{ rotate: spin }] }]}
          />
          <Text style={styles.loadingText}>Creating your account. Please wait...</Text>
        </View>
      </View>
    </Modal>
  );

  const SuccessModal = () => (
    <Modal transparent={true} animationType="fade" visible={showSuccessModal}>
      <View style={styles.modalBackground}>
        <Animated.View
          style={[
            styles.modalContent,
            {
              opacity: fadeValue,
              transform: [{ scale: scaleValue }],
            },
          ]}
        >
          <View style={[styles.iconCircle, styles.successCircle]}>
            <Text style={styles.icon}>✓</Text>
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
  );

  const ErrorModal = () => (
    <Modal transparent={true} animationType="fade" visible={showErrorModal}>
      <View style={styles.modalBackground}>
        <Animated.View
          style={[
            styles.modalContent,
            {
              opacity: fadeValue,
              transform: [{ scale: scaleValue }],
            },
          ]}
        >
          <View style={[styles.iconCircle, styles.errorCircle]}>
            <Text style={styles.icon}>!</Text>
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
  );

  const takePicture = async () => {
    if (cameraRef.current) {
      try {
        const photo = await cameraRef.current.takePictureAsync({ quality: 1 });
        const localUri = FileSystem.documentDirectory + "temp_photo.jpg";
        await FileSystem.moveAsync({
          from: photo.uri,
          to: localUri,
        });
        setTempImage(localUri);
        setIsCameraVisible(false);
        setIsImagePreviewVisible(true);
      } catch (error) {
        console.error("Error taking picture:", error);
        Alert.alert("Error", "Failed to take picture. Please try again.");
      }
    }
  };

  const toggleCameraFacing = () => {
    setFacing((current) => (current === "back" ? "front" : "back"));
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.cancelled) {
      setImage(result.uri); // Ensure this matches your state management
      console.log("Image URI:", result.uri); // Debug: log the URI
    }
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

  if (!permission) {
    return <View />;
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={{ textAlign: "center" }}>
          We need your permission to use the camera
        </Text>
        <TouchableOpacity style={styles.button} onPress={requestPermission}>
          <Text style={styles.buttonText}>Grant permission</Text>
        </TouchableOpacity>
      </View>
    );
  }


const renderInput = (placeholder, value, onChangeText, secureTextEntry = false) => (
    <BlurView intensity={20} tint="light" style={styles.inputContainer}>
      <TextInput
        style={styles.input}
        placeholder={placeholder}
        placeholderTextColor="#A0AEC0"
        value={value}
        onChangeText={onChangeText}
        secureTextEntry={secureTextEntry}
      />
    </BlurView>
  );


  return (
    <SafeAreaView
      style={[
        styles.container,
        { backgroundColor: isDarkMode ? "#000" : "#fff" },
      ]}
    >
      <ScrollView
        contentContainerStyle={[styles.scrollViewContent, { paddingTop: 10 }]}
      >
        <Text style={[styles.title, { color: isDarkMode ? "#fff" : "#000" }]}>
          Sign Up for ElJardinVerde Club
        </Text>

        <TextInput
          style={[
            styles.input,
            {
              color: isDarkMode ? "#fff" : "#000",
              borderColor: isDarkMode ? "#444" : "#ccc",
            },
          ]}
          placeholder="First Name"
          placeholderTextColor={isDarkMode ? "#888" : "#666"}
          value={formData.firstname}
          onChangeText={(text) => setFormData({ ...formData, firstname: text })}
        />

        <TextInput
          style={[
            styles.input,
            {
              color: isDarkMode ? "#fff" : "#000",
              borderColor: isDarkMode ? "#444" : "#ccc",
            },
          ]}
          placeholder="Last Name"
          placeholderTextColor={isDarkMode ? "#888" : "#666"}
          value={formData.lastname}
          onChangeText={(text) => setFormData({ ...formData, lastname: text })}
        />

        <TouchableOpacity
          onPress={() => setShowDatePicker(true)}
          style={[
            styles.datePickerButton,
            { borderColor: isDarkMode ? "#444" : "#ccc" },
          ]}
        >
          <Text
            style={[
              styles.datePickerText,
              { color: isDarkMode ? "#fff" : "#000" },
            ]}
          >
            Date of Birth: {formData.dob.toDateString()}
          </Text>
        </TouchableOpacity>

        {showDatePicker &&
          (Platform.OS === "ios" ? (
            <Modal
              transparent={true}
              animationType="slide"
              visible={showDatePicker}
              onRequestClose={() => setShowDatePicker(false)}
            >
              <View style={styles.modalContainer}>
                <View
                  style={[
                    styles.modalContent,
                    { backgroundColor: isDarkMode ? "#333" : "#fff" },
                  ]}
                >
                  <DateTimePicker
                    value={formData.dob}
                    mode="date"
                    display="spinner"
                    onChange={onDateChange}
                    style={styles.datePicker}
                    textColor={isDarkMode ? "#fff" : "#000"}
                  />
                  <TouchableOpacity
                    style={[styles.button, styles.modalButton]}
                    onPress={() => setShowDatePicker(false)}
                  >
                    <Text style={styles.buttonText}>Confirm</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </Modal>
          ) : (
            <DateTimePicker
              value={formData.dob}
              mode="date"
              display="default"
              onChange={onDateChange}
              style={[
                styles.datePicker,
                { borderColor: isDarkMode ? "#444" : "#ccc" },
              ]}
            />
          ))}

        <TextInput
          style={[
            styles.input,
            {
              color: isDarkMode ? "#fff" : "#000",
              borderColor: isDarkMode ? "#444" : "#ccc",
            },
          ]}
          placeholder="Place of Birth"
          placeholderTextColor={isDarkMode ? "#888" : "#666"}
          value={formData.placeOfBirth}
          onChangeText={(text) =>
            setFormData({ ...formData, placeOfBirth: text })
          }
        />

        <View style={styles.pickerContainer}>
          {Platform.OS === "ios" ? (
            <TouchableOpacity
              onPress={() => setShowCountryPicker(true)}
              style={styles.pickerButton}
            >
              <Text style={{ color: isDarkMode ? "#fff" : "#000" }}>
                {formData.countryOfResidence || "Select Country of Residence"}
              </Text>
            </TouchableOpacity>
          ) : (
            <Picker
              selectedValue={formData.countryOfResidence}
              onValueChange={(itemValue) =>
                setFormData({ ...formData, countryOfResidence: itemValue })
              }
              style={[
                styles.picker,
                {
                  color: isDarkMode ? "#fff" : "#000",
                  borderColor: isDarkMode ? "#444" : "#ccc",
                },
              ]}
            >
              {countries.map((country) => (
                <Picker.Item
                  key={country.code}
                  label={country.name}
                  value={country.name}
                />
              ))}
            </Picker>
          )}
        </View>

        <View
          style={[
            styles.pickerContainer,
            { borderColor: isDarkMode ? "#444" : "#ccc" },
          ]}
        >
          {Platform.OS === "ios" ? (
            <TouchableOpacity
              onPress={() => setShowIDPicker(true)}
              style={styles.pickerButton}
            >
              <Text style={{ color: isDarkMode ? "#fff" : "#000" }}>
                {formData.formOfIdentification || "Select ID Type"}
              </Text>
            </TouchableOpacity>
          ) : (
            <Picker
              selectedValue={formData.formOfIdentification}
              onValueChange={(itemValue) =>
                setFormData({ ...formData, formOfIdentification: itemValue })
              }
              style={[styles.picker, { color: isDarkMode ? "#fff" : "#000" }]}
            >
              <Picker.Item label="Select ID Type" value="" />
              <Picker.Item label="ID" value="ID" />
              <Picker.Item label="Passport" value="Passport" />
              <Picker.Item label="Driver's License" value="Driver's License" />
            </Picker>
          )}
        </View>

        <TextInput
          style={[
            styles.input,
            {
              color: isDarkMode ? "#fff" : "#000",
              borderColor: isDarkMode ? "#444" : "#ccc",
            },
          ]}
          placeholder="Email"
          placeholderTextColor={isDarkMode ? "#888" : "#666"}
          value={formData.email}
          onChangeText={(text) => setFormData({ ...formData, email: text })}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <TextInput
          style={[
            styles.input,
            {
              color: isDarkMode ? "#fff" : "#000",
              borderColor: isDarkMode ? "#444" : "#ccc",
            },
          ]}
          placeholder="Password"
          placeholderTextColor={isDarkMode ? "#888" : "#666"}
          value={formData.password}
          onChangeText={(text) => setFormData({ ...formData, password: text })}
          secureTextEntry
        />

        <TextInput
          style={[
            styles.input,
            {
              color: isDarkMode ? "#fff" : "#000",
              borderColor: isDarkMode ? "#444" : "#ccc",
            },
          ]}
          placeholder="Retype Password"
          placeholderTextColor={isDarkMode ? "#888" : "#666"}
          value={formData.retypePassword}
          onChangeText={(text) =>
            setFormData({ ...formData, retypePassword: text })
          }
          secureTextEntry
        />

        <TouchableOpacity
          style={styles.button}
          onPress={() => setIsCameraVisible(true)}
        >
          <Text style={styles.buttonText}>Take a Picture with your ID</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.button}
          onPress={handleSignup}
          disabled={uploading}
        >
          <Text style={styles.buttonText}>
            {uploading ? "Signing Up..." : "Sign Up"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Text
            style={[
              styles.backLink,
              { color: isDarkMode ? "#4ade80" : "#16a34a" },
            ]}
          >
            Back to Login
          </Text>
        </TouchableOpacity>
      </ScrollView>

      {isCameraVisible && (
        <Modal visible={isCameraVisible} animationType="slide">
          <SafeAreaView style={styles.cameraContainer}>
            <CameraView style={styles.camera} facing={facing} ref={cameraRef}>
              <View style={styles.cameraControls}>
                <TouchableOpacity
                  style={styles.captureButton}
                  onPress={takePicture}
                >
                  <Text style={styles.buttonText}>Capture</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.captureButton}
                  onPress={toggleCameraFacing}
                >
                  <Text style={styles.buttonText}>Flip</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.captureButton}
                  onPress={() => setIsCameraVisible(false)}
                >
                  <Text style={styles.buttonText}>Close</Text>
                </TouchableOpacity>
              </View>
            </CameraView>
          </SafeAreaView>
        </Modal>
      )}

      {isImagePreviewVisible && (
        <Modal visible={isImagePreviewVisible} animationType="slide">
          <SafeAreaView style={styles.imagePreviewContainer}>
            <Image source={{ uri: tempImage }} style={styles.previewImage} />
            <View style={styles.previewControls}>
              <TouchableOpacity
                style={styles.previewButton}
                onPress={retakePhoto}
              >
                <Text style={styles.buttonText}>Retake</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.previewButton}
                onPress={confirmPhoto}
              >
                <Text style={styles.buttonText}>Keep Photo</Text>
              </TouchableOpacity>
            </View>
          </SafeAreaView>
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
              style={[styles.picker, { color: isDarkMode ? "#fff" : "#000" }]}
            >
              <Picker.Item label="Select Country of Residence" value="" />
              {countries.map((country) => (
                <Picker.Item
                  key={country.code}
                  label={country.name}
                  value={country.name}
                />
              ))}
            </Picker>
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setShowCountryPicker(false)}
            >
              <Text style={styles.modalCloseButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal visible={showIDPicker} animationType="slide" transparent={true}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Picker
              selectedValue={formData.formOfIdentification}
              onValueChange={(itemValue) => {
                setFormData({ ...formData, formOfIdentification: itemValue });
                setShowIDPicker(false);
              }}
              style={[styles.picker, { color: isDarkMode ? "#fff" : "#000" }]}
            >
              <Picker.Item label="Select ID Type" value="" />
              <Picker.Item label="ID" value="ID" />
              <Picker.Item label="Passport" value="Passport" />
              <Picker.Item label="Driver's License" value="Driver's License" />
            </Picker>
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setShowIDPicker(false)}
            >
              <Text style={styles.modalCloseButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal
        animationType="slide"
        transparent={true}
        visible={showSuccessModal}
        onRequestClose={() => {
          setShowSuccessModal(false);
          router.replace("/"); // Optionally navigate to login screen
        }}
      >
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <Text style={styles.modalText}>
              Registration successful! You can now log in with your email and
              password.
            </Text>
            <TouchableOpacity
              style={[styles.button, styles.buttonClose]}
              onPress={() => {
                setShowSuccessModal(false);
                router.replace("/"); // Optionally navigate to login screen
              }}
            >
              <Text style={styles.textStyle}>Okay</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <LoadingModal />
      <SuccessModal />
      <ErrorModal />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingVertical: 5,
  },
  scrollViewContent: {
    flexGrow: 1,
    padding: 5,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  input: {
    width: "100%",
    height: 40,
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    marginBottom: 15,
  },
  datePickerButton: {
    width: "100%",
    height: 40,
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    marginBottom: 15,
    justifyContent: "center",
  },
  datePickerText: {
    fontSize: 16,
  },
  datePicker: {
    width: "100%",
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
  },
  pickerContainer: {
    borderWidth: 1,
    borderRadius: 5,
    marginBottom: 15,
    overflow: "hidden",
  },
  picker: {
    width: "100%",
    height: 40,
  },
  pickerButton: {
    height: 40,
    justifyContent: "center",
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
  },
  button: {
    backgroundColor: "#4ade80",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 5,
    marginTop: 10,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  backButton: {
    marginTop: 20,
    alignItems: "center",
  },
  backLink: {
    fontSize: 16,
    textDecorationLine: "underline",
  },
  cameraContainer: {
    flex: 1,
    backgroundColor: "black",
  },
  camera: {
    flex: 1,
    width: "100%",
  },
  cameraControls: {
    flexDirection: "row",
    justifyContent: "space-around",
    position: "absolute",
    bottom: 20,
    left: 0,
    right: 0,
  },
  captureButton: {
    backgroundColor: "#4ade80",
    padding: 15,
    borderRadius: 10,
  },
  imagePreviewContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "black",
  },
  previewImage: {
    width: "90%",
    height: "70%",
    resizeMode: "contain",
  },
  previewControls: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
    position: "absolute",
    bottom: 20,
  },
  previewButton: {
    backgroundColor: "#4ade80",
    padding: 15,
    borderRadius: 10,
    width: "40%",
    alignItems: "center",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: "white",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    height: "40%",
  },
  modalCloseButton: {
    alignSelf: "flex-end",
    padding: 10,
  },
  modalCloseButtonText: {
    color: "#007AFF",
    fontSize: 18,
  },
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 22,
  },
  modalView: {
    margin: 20,
    backgroundColor: "white",
    borderRadius: 20,
    padding: 35,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalText: {
    marginBottom: 15,
    textAlign: "center",
  },
  buttonClose: {
    backgroundColor: "#2196F3",
  },
  textStyle: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center",
  },
  modalBackground: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  activityIndicatorWrapper: {
    backgroundColor: "white",
    borderRadius: 10,
    padding: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  modalContent: {
    backgroundColor: "white",
    borderRadius: 20,
    padding: 30,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  lottieAnimation: {
    width: 150,
    height: 150,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    fontWeight: "600",
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
  },
  modalText: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 20,
  },
  errorText: {
    fontSize: 14,
    color: "red",
    textAlign: "center",
    marginBottom: 20,
  },
  modalButton: {
    backgroundColor: "#4ade80",
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
  },
  modalButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
});

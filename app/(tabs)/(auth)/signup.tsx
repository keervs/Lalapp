import { useState } from "react";
import {
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";

import { useLocalSearchParams, useRouter } from "expo-router";

import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "../../../lib/firebaseConfig";

export default function Signup() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isDesktop = width > 768;

  const { role } = useLocalSearchParams();

  const [name, setName] = useState("");
  const [semester, setSemester] = useState("");
  const [branch, setBranch] = useState("");
  const [regNo, setRegNo] = useState("");
  const [admNo, setAdmNo] = useState("");

  const [isUnion, setIsUnion] = useState(role === "union");

  const [showToast, setShowToast] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSignup = async () => {
    if (loading) return;

    console.log("🔥 Signup button clicked");

    // ✅ Validation
    if (!name || !semester || !branch || !regNo || !admNo) {
      Alert.alert("Error", "Please fill all fields");
      return;
    }

    const normalizedReg = regNo.trim().toLowerCase();

    if (normalizedReg.length < 3) {
      Alert.alert("Error", "Invalid Registration Number");
      return;
    }

    if (admNo.length < 4) {
      Alert.alert("Error", "Password must be at least 4 characters");
      return;
    }

    const email = `${normalizedReg}@lalapp.com`;
    const password = admNo;

    try {
      setLoading(true);

      console.log("⏳ Creating user...");

      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      console.log("✅ Auth success");

      const user = userCredential.user;

      await setDoc(doc(db, "users", user.uid), {
        name: name.trim(),
        semester: semester.trim(),
        branch: branch.trim(),
        regNo: normalizedReg,
        email,
        role: isUnion ? "union" : "university",
        badgeVerified: false,
        createdAt: new Date(),
      });

      console.log("🔥 Firestore Project:", db.app.options.projectId);
      console.log("✅ Firestore success");

      // 🎉 Show toast
      setShowToast(true);

      // 🧠 Force UI render
      await new Promise((resolve) => setTimeout(resolve, 100));

      // 🔍 DEBUG ALERT (to confirm code reaches here)
      Alert.alert("DEBUG", "Navigation triggered");

      // 🚀 AUTO NAVIGATION (after delay)
      setTimeout(() => {
        router.replace({
          pathname: "/signin",
          params: { email },
        });
      }, 1800);

      // 🛟 FALLBACK SUCCESS ALERT (guaranteed UX)
      Alert.alert("Success", "Account created successfully!", [
        {
          text: "OK",
          onPress: () => {
            router.replace({
              pathname: "/signin",
              params: { email },
            });
          },
        },
      ]);

    } catch (error: any) {
      console.log("❌ ERROR:", error.message);

      let message = "Something went wrong. Please try again.";

      if (error.code === "auth/email-already-in-use") {
        message = "Account already exists. Please sign in.";
      } else if (error.code === "auth/invalid-email") {
        message = "Invalid registration number.";
      } else if (error.code === "auth/weak-password") {
        message = "Weak password. Try a stronger one.";
      }

      Alert.alert("Signup Failed", message);

    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={[styles.card, isDesktop && styles.desktopCard]}>

          {/* LOGO */}
          <Image
            source={require("../../_assets/splash.png")}
            style={[styles.logo, isDesktop && styles.logoDesktop]}
            resizeMode="contain"
          />

          <Text style={styles.union}>LBSITW COLLEGE UNION 2025–26</Text>
          <Text style={styles.title}>LALAPP</Text>
          <Text style={styles.union}>LBSITW COLLEGE UNION 2025–26</Text>

          <Text style={styles.create}>CREATE ACCOUNT</Text>

          {/* Inputs */}
          <View style={styles.inputContainer}>
            <TextInput
              placeholder="First Name"
              style={styles.input}
              value={name}
              onChangeText={setName}
            />

            <TextInput
              placeholder="Semester"
              style={styles.input}
              value={semester}
              onChangeText={setSemester}
            />

            <TextInput
              placeholder="Branch"
              style={styles.input}
              value={branch}
              onChangeText={setBranch}
            />

            <TextInput
              placeholder="Registration Number"
              style={styles.input}
              value={regNo}
              onChangeText={setRegNo}
            />

            <TextInput
              placeholder="Admission Number"
              secureTextEntry
              style={styles.input}
              value={admNo}
              onChangeText={setAdmNo}
            />
          </View>

          {/* Role */}
          <TouchableOpacity
            style={styles.checkboxRow}
            onPress={() => {
              if (!role) setIsUnion(!isUnion);
            }}
          >
            <View style={[styles.checkbox, isUnion && styles.checked]} />
            <Text style={styles.checkboxText}>Union Member</Text>
          </TouchableOpacity>

          {/* Button */}
          <TouchableOpacity style={styles.signUpBtn} onPress={handleSignup}>
            <Text style={styles.signUpText}>CREATE ACCOUNT</Text>
          </TouchableOpacity>

          {/* Sign In redirect */}
          <View style={styles.signinRow}>
            <Text style={styles.newUser}>Already have an account?</Text>

            <TouchableOpacity onPress={() => router.replace("/signin")}>
              <Text style={styles.signinText}>Sign In</Text>
            </TouchableOpacity>
          </View>

        </View>
      </ScrollView>

      {/* 🔥 TOAST */}
      {showToast && (
        <View style={styles.toast}>
          <Text style={styles.toastText}>
            🎉 Account Created Successfully!
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: "#F6DDE0",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },

  card: {
    width: "100%",
  },

  desktopCard: {
    maxWidth: 500,
    backgroundColor: "#fff",
    padding: 30,
    borderRadius: 20,
  },

  logo: {
    width: 120,
    height: 120,
    alignSelf: "center",
  },

  logoDesktop: {
    width: 150,
    height: 150,
  },

  union: {
    fontSize: 12,
    color: "#444",
    textAlign: "center",
    marginBottom: 4,
  },

  title: {
    fontSize: 28,
    fontWeight: "700",
    textAlign: "center",
  },

  create: {
    fontSize: 22,
    fontWeight: "700",
    textAlign: "center",
    marginTop: 20,
  },

  inputContainer: {
    marginTop: 20,
    width: "100%",
  },

  input: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
  },

  checkboxRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
  },

  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 1,
    borderColor: "#b45c64",
    marginRight: 10,
  },

  checked: {
    backgroundColor: "#b45c64",
  },

  checkboxText: {
    fontSize: 16,
  },

  signUpBtn: {
    marginTop: 20,
    backgroundColor: "#b45c64",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },

  signUpText: {
    color: "#fff",
    fontWeight: "700",
  },

  signinRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 25,
    gap: 10,
  },

  newUser: {
    color: "#666",
  },

  signinText: {
    color: "#b45c64",
    fontWeight: "600",
  },

  toast: {
    position: "absolute",
    bottom: 40,
    left: 20,
    right: 20,
    backgroundColor: "#b45c64",
    padding: 15,
    borderRadius: 12,
    alignItems: "center",
  },

  toastText: {
    color: "#fff",
    fontWeight: "600",
  },
});
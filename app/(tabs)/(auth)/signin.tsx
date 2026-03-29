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

import { useRouter } from "expo-router";

import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../../../lib/firebaseConfig";

export default function SignIn() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isDesktop = width > 768;

  const [regNo, setRegNo] = useState("");
  const [admNo, setAdmNo] = useState("");
  const [role, setRole] = useState<"university" | "union" | null>(null);

  const handleLogin = async () => {
    if (!regNo || !admNo || !role) {
      Alert.alert("Error", "Please fill all fields and select role");
      return;
    }

    const normalizedReg = regNo.trim().toLowerCase();
    const email = `${normalizedReg}@lalapp.com`;
    const password = admNo;

    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );

      const user = userCredential.user;

      // ✅ Correct Firestore fetch using UID
      const userSnap = await getDoc(doc(db, "users", user.uid));

      if (!userSnap.exists()) {
        Alert.alert("Error", "User data not found");
        return;
      }

      const userData = userSnap.data();

      if (userData.role !== role) {
        Alert.alert("Error", "Wrong user type selected");
        return;
      }

      // ✅ Navigation
      if (role === "union") {
        router.replace("./(tabs)/badge_verification");
      } else {
        router.replace("./(tabs)/home");
      }

    } catch (error: any) {
      Alert.alert("Login Failed", error.message);
    }
  };

  return (
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

        <Text style={styles.create}>SIGN IN</Text>

        {/* Inputs */}
        <View style={styles.inputContainer}>
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

        {/* ROLE SELECT */}
        <View style={styles.roleRow}>
          <TouchableOpacity
            style={[
              styles.roleBtn,
              role === "university" && styles.selectedRole,
            ]}
            onPress={() => setRole("university")}
          >
            <Text style={styles.roleText}>LBT-IANS</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.roleBtn,
              role === "union" && styles.selectedRole,
            ]}
            onPress={() => setRole("union")}
          >
            <Text style={styles.roleText}>LBT-UNIONITES</Text>
          </TouchableOpacity>
        </View>

        {/* SIGN IN BUTTON */}
        <TouchableOpacity style={styles.signInBtn} onPress={handleLogin}>
          <Text style={styles.signInText}>SIGN IN</Text>
        </TouchableOpacity>

        {/* SIGN UP (FIXED LOGIC HERE) */}
        <View style={styles.signupRow}>
          <Text style={styles.newUser}>New user?</Text>

          <TouchableOpacity
            onPress={() => {
              if (!role) {
                Alert.alert("Select User Type", "Please choose a role first");
                return;
              }

              router.push({
                pathname: "/signup",
                params: { role },
              });
            }}
          >
            <Text style={styles.signupText}>Sign Up</Text>
          </TouchableOpacity>
        </View>

      </View>
    </ScrollView>
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
  },

  input: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
  },

  roleRow: {
    flexDirection: "row",
    marginTop: 10,
    justifyContent: "space-between",
  },

  roleBtn: {
    flex: 1,
    padding: 12,
    marginHorizontal: 5,
    backgroundColor: "#eee",
    borderRadius: 10,
    alignItems: "center",
  },

  selectedRole: {
    backgroundColor: "#b45c64",
  },

  roleText: {
    fontWeight: "600",
  },

  signInBtn: {
    marginTop: 20,
    backgroundColor: "#b45c64",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },

  signInText: {
    color: "#fff",
    fontWeight: "700",
  },

  signupRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 25,
    gap: 10,
  },

  newUser: {
    color: "#666",
  },

  signupText: {
    color: "#b45c64",
    fontWeight: "600",
  },
});
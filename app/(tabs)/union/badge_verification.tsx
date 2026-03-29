import * as ImagePicker from "expo-image-picker";
import { useState } from "react";
import {
  Alert,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { doc, updateDoc } from "firebase/firestore";
import { auth, db } from "../../../lib/firebaseConfig";

import { useRouter } from "expo-router";
import { verifyBadge } from "../../../utils/verifyBadge";

export default function BadgeUpload() {
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const router = useRouter();
  const pickImage = async () => {
    const permission =
      await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      Alert.alert("Permission required", "Allow access to gallery");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      quality: 0.7,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const handleUpload = async () => {
    if (!image) {
      Alert.alert("Error", "Please upload a badge photo");
      return;
    }

    try {
      setLoading(true);

      const user = auth.currentUser;

      if (!user) {
        Alert.alert("Error", "User not logged in");
        return;
      }

      const isValid = await verifyBadge(image);

      await updateDoc(doc(db, "users", user.uid), {
        badgeVerified: isValid,
      });

      if (isValid) {
        router.replace("./university/home");
      } else {
        Alert.alert(
          "❌ Verification Failed",
          "This image does not match the official badge format.\nPlease upload a clear badge photo."
        );
      }
    } catch (error) {
      console.log(error);
      Alert.alert("Error", "Verification failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        UNION MEMBER BADGE UPLOAD
      </Text>

      <Text style={styles.subtitle}>
        Please upload photo of your official college union badge.
      </Text>

      <TouchableOpacity
        style={styles.uploadBox}
        onPress={pickImage}
      >
        {image ? (
          <Image
            source={{ uri: image }}
            style={styles.preview}
          />
        ) : (
          <Text>Upload Badge Photo</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.button}
        onPress={handleUpload}
      >
        <Text style={styles.buttonText}>
          {loading ? "VERIFYING..." : "SUBMIT"}
        </Text>
      </TouchableOpacity>

      {loading && (
        <Text style={styles.loadingText}>
          ⏳ Verifying badge...
        </Text>
      )}
    </View>
  );
}

/* ================= STYLES ================= */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
  },

  title: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 10,
  },

  subtitle: {
    fontSize: 14,
    marginBottom: 20,
  },

  uploadBox: {
    height: 150,
    borderWidth: 1,
    borderStyle: "dashed",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },

  preview: {
    width: "100%",
    height: "100%",
  },

  button: {
    backgroundColor: "#b45c64",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
  },

  buttonText: {
    color: "#fff",
    fontWeight: "700",
  },

  loadingText: {
    textAlign: "center",
    marginTop: 10,
  },
});
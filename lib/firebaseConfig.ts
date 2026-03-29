// lib/firebaseConfig.ts

import AsyncStorage from "@react-native-async-storage/async-storage";
import { initializeApp } from "firebase/app";
import { Auth, getAuth, initializeAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAO8-lDbbNh_hFi51ikbrQPpzLjxQS3Dcg",
  authDomain: "lalappp.firebaseapp.com",
  projectId: "lalappp",
  storageBucket: "lalappp.firebasestorage.app",
  messagingSenderId: "71560906262",
  appId: "1:71560906262:web:b42aa0718935dfc38c9737",
};

const app = initializeApp(firebaseConfig);

// ✅ THIS LINE FIXES YOUR ERROR
let auth: Auth;

try {
  const { getReactNativePersistence } = require("firebase/auth/react-native");

  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage),
  });

  console.log("✅ Auth with persistence");
} catch (e) {
  auth = getAuth(app);
  console.log("⚠️ Fallback auth");
}

export { auth };
export const db = getFirestore(app);
// lib/firebaseConfig.ts

import { initializeApp } from "firebase/app";
import { initializeAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// 👇 IMPORTANT (no TS error version)
import AsyncStorage from "@react-native-async-storage/async-storage";

// 👇 workaround import
const { getReactNativePersistence } = require("firebase/auth/react-native");

// 🔑 Your config
const firebaseConfig = {
  apiKey: "AIzaSyAO8-lDbbNh_hFi51ikbrQPpzLjxQS3Dcg",
  authDomain: "lalappp.firebaseapp.com",
  projectId: "lalappp",
  storageBucket: "lalappp.firebasestorage.app",
  messagingSenderId: "71560906262",
  appId: "1:71560906262:web:b42aa0718935dfc38c9737",
};

// 🚀 Init app
const app = initializeApp(firebaseConfig);

// ✅ AUTH WITH PERSISTENCE (FIXED)
export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});

// ✅ Firestore
export const db = getFirestore(app);
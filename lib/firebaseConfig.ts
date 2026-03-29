// lib/firebaseConfig.ts

import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

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

// ✅ SIMPLE AUTH (works 100% in Expo)
export const auth = getAuth(app);

// ✅ Firestore
export const db = getFirestore(app);
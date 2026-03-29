import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { initializeFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAO8-lDbbNh_hFi51ikbrQPpzLjxQS3Dcg",
  authDomain: "lalappp.firebaseapp.com",
  projectId: "lalappp",
  storageBucket: "lalappp.firebasestorage.app",
  messagingSenderId: "71560906262",
  appId: "1:71560906262:web:b42aa0718935dfc38c9737",
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// ✅ ONLY this (no extra flags)
export const db = initializeFirestore(app, {
  experimentalForceLongPolling: true,
});

export const auth = getAuth(app);
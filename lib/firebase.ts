import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// 🔐 Firebase configuration
// Get these values from:
// Firebase Console → Project Settings → General → Your apps (Web)
const firebaseConfig = {
  apiKey: "AIzaSyBskfJ9RG6QANKma4yqR4WkKTHaYKMvzUU",
  authDomain: "lalapp1.firebaseapp.com",
  projectId: "lalapp1",
  storageBucket: "lalapp1.firebasestorage.app",
  messagingSenderId: "886261966362",
  appId: "1:886261966362:web:a5ff7711af9e8d347d13a3",
};

// 🚀 Initialize Firebase
const app = initializeApp(firebaseConfig);

// 🔑 Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);

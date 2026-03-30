import { getApp, getApps, initializeApp } from "firebase/app";
import { initializeAuth, inMemoryPersistence } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAO8-lDbbNh_hFi51ikbrQPpzLjxQS3Dcg",
  authDomain: "lalappp.firebaseapp.com",
  projectId: "lalappp",
  storageBucket: "lalappp.firebasestorage.app",
  messagingSenderId: "71560906262",
  appId: "1:71560906262:web:b42aa0718935dfc38c9737"
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

export const auth = initializeAuth(app, {
  persistence: inMemoryPersistence
});

export const db = getFirestore(app);
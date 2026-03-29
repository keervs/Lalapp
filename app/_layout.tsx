import { Stack, useRouter, useSegments } from "expo-router";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { useEffect } from "react";
import { auth, db } from "../lib/firebaseConfig";

export default function RootLayout() {
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      const rootRoute = segments[0];

      const isAuthScreen =
        rootRoute === "signin" || rootRoute === "signup";

      // 🔐 Not logged in
      if (!user && !isAuthScreen) {
        router.replace("/signin");
        return;
      }

      // ✅ Logged in
      if (user) {
        try {
          const userSnap = await getDoc(doc(db, "users", user.uid));

          if (!userSnap.exists()) {
            router.replace("/signin");
            return;
          }

          const role = userSnap.data().role;

          // 🎯 ROLE-BASED REDIRECT (FIXED)
          if (role === "union") {
            if (rootRoute !== "union") {
              router.replace("/union/home");
            }
          } else {
            if (rootRoute !== "university") {
              router.replace("/university/home");
            }
          }

        } catch (error) {
          console.log("Role fetch error:", error);
          router.replace("/signin");
        }
      }
    });

    return unsubscribe;
  }, [segments]);

  return <Stack screenOptions={{ headerShown: false }} />;
}
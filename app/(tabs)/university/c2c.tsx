// C2C.tsx — Student View
import axios from "axios";
import {
  collection,
  doc,
  onSnapshot,
  query,
  where,
} from "firebase/firestore";
import { useEffect, useState } from "react";
import {
  Image,
  Modal,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { WebView } from "react-native-webview";
import { auth, db } from "../../../lib/firebase";

const BACKEND_URL = "https://lalapp-production.up.railway.app";

type FestType = {
  id: string;
  name: string;
  target: number;
  totalPaid: number;
  installmentAmount: number;
  subTarget?: number;
  deadline?: string;
};

type ContributionType = {
  festId: string;
  totalPaid: number;
  pending: number;
};

export default function C2C() {
  const [selectedFest, setSelectedFest] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [paymentHtml, setPaymentHtml] = useState("");

  // Live from Firestore
  const [fests, setFests] = useState<FestType[]>([]);
  // Per-student contributions map: festId → { totalPaid, pending }
  const [contributions, setContributions] = useState<Record<string, ContributionType>>({});
  const [userInfo, setUserInfo] = useState<{ uid: string; regNo: string; name: string } | null>(null);

  // 1. Get current user info from Firestore users/
  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;
    const unsub = onSnapshot(doc(db, "users", user.uid), (snap) => {
      if (snap.exists()) {
        const d = snap.data();
        setUserInfo({ uid: user.uid, regNo: d.regNo, name: d.name });
      }
    });
    return () => unsub();
  }, []);

  // 2. Live fests from Firestore
  useEffect(() => {
    const unsub = onSnapshot(collection(db, "fests"), (snap) => {
      const data: FestType[] = snap.docs.map((d) => ({
        id: d.id,
        name: d.data().name,
        target: d.data().target,
        totalPaid: d.data().totalPaid ?? 0,
        installmentAmount: d.data().installmentAmount ?? 0,
        subTarget: d.data().subTarget,
        deadline: d.data().deadline,
      }));
      setFests(data);
    });
    return () => unsub();
  }, []);

  // 3. Live contributions for this student
  useEffect(() => {
    if (!userInfo) return;
    const q = query(
      collection(db, "contributions"),
      where("userId", "==", userInfo.uid)
    );
    const unsub = onSnapshot(q, (snap) => {
      const map: Record<string, ContributionType> = {};
      snap.docs.forEach((d) => {
        const data = d.data();
        map[data.festId] = {
          festId: data.festId,
          totalPaid: data.totalPaid ?? 0,
          pending: data.pending ?? 0,
        };
      });
      setContributions(map);
    });
    return () => unsub();
  }, [userInfo]);

  const handlePay = async () => {
    if (!selectedFest || !userInfo) {
      alert("Select a fest first");
      return;
    }

    const fest = fests.find((f) => f.id === selectedFest);
    if (!fest) return;

    const contrib = contributions[selectedFest];
    const pending = contrib ? contrib.pending : fest.target;

    if (pending <= 0) {
      alert("You have fully paid for this fest!");
      return;
    }

    const amountToPay = Math.min(fest.installmentAmount, pending);

    setLoading(true);
    try {
      const res = await axios.post(`${BACKEND_URL}/create-order`, {
        orderAmount: amountToPay,
        festId: fest.id,
        userId: userInfo.uid,
        regNo: userInfo.regNo,
        name: userInfo.name,
      });

      const sessionId = res.data.paymentSessionId;

      const html = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <script src="https://sdk.cashfree.com/js/v3/cashfree.js"></script>
            <style>body { margin: 0; padding: 0; font-family: sans-serif; }</style>
          </head>
          <body>
            <script>
              const cashfree = Cashfree({ mode: "sandbox" });
              cashfree.checkout({
                paymentSessionId: "${sessionId}",
                redirectTarget: "_self",
              });
            </script>
          </body>
        </html>
      `;

      setPaymentHtml(html);
      setShowPayment(true);
    } catch (err) {
      console.log(err);
      alert("Payment initialization failed. Is your backend running?");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Image
        source={require("../../_assets/splash.png")}
        style={styles.logo}
        resizeMode="contain"
      />
      <Text style={styles.subText}>LBT COLLEGE UNION 2025–26</Text>
      <Text style={styles.header}>LALAPP</Text>

      <View style={styles.festRow}>
        {fests.map((fest) => {
          const contrib = contributions[fest.id];
          const myPaid = contrib ? contrib.totalPaid : 0;
          const myPending = contrib ? contrib.pending : fest.target;
          const isSelected = selectedFest === fest.id;
          const isPaid = myPending <= 0;

          return (
            <View key={fest.id} style={styles.festBlock}>
              <Pressable
                onPress={() => !isPaid && setSelectedFest(fest.id)}
                style={[styles.festButton, isSelected && styles.selectedFest]}
              >
                <Text style={styles.festText}>{fest.name}</Text>
                {isPaid && <Text style={styles.paidBadge}>✅ PAID</Text>}
              </Pressable>

              {/* Payment Target Banner — shows only if admin has set it */}
              {fest.subTarget && fest.deadline ? (
                <View style={styles.targetBanner}>
                  <Text style={styles.targetBannerText}>
                    🎯 ₹{fest.subTarget} by {fest.deadline}
                  </Text>
                </View>
              ) : null}

              <Text style={styles.label}>PENDING ⏱</Text>
              <Text style={styles.value}>₹{myPending}</Text>
              <Text style={styles.label}>PAID 💰</Text>
              <Text style={styles.value}>₹{myPaid}</Text>
            </View>
          );
        })}
      </View>

      <Pressable
        style={[styles.payButton, loading && { opacity: 0.6 }]}
        onPress={handlePay}
        disabled={loading}
      >
        <Text style={styles.payText}>
          {loading ? "LOADING..." : selectedFest ? "PAY" : "PICK A FEST"}
        </Text>
      </Pressable>

      <Modal visible={showPayment} animationType="slide">
        <SafeAreaView style={{ flex: 1 }}>
          <Pressable style={styles.closeButton} onPress={() => setShowPayment(false)}>
            <Text style={styles.closeText}>✕ Close</Text>
          </Pressable>
          <WebView
            source={{ html: paymentHtml }}
            javaScriptEnabled={true}
            domStorageEnabled={true}
            onNavigationStateChange={(navState) => {
              if (navState.url.includes("/payment-success")) {
                setShowPayment(false);
                alert("Payment Successful! ✅");
                setSelectedFest(null);
              } else if (navState.url.includes("/payment-failed")) {
                setShowPayment(false);
                alert("Payment Failed ❌");
              }
            }}
          />
        </SafeAreaView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F6DDE0",
    alignItems: "center",
    paddingTop: 60,
  },
  logo: { width: 120, height: 120, marginBottom: 10 },
  header: { fontSize: 24, fontWeight: "700" },
  subText: { fontSize: 12, color: "#555", marginBottom: 40 },
  festRow: { flexDirection: "row", justifyContent: "center", width: "100%" },
  festBlock: { alignItems: "center", flex: 1 },
  festButton: { paddingVertical: 6, paddingHorizontal: 10, marginBottom: 20 },
  selectedFest: { borderBottomWidth: 2, borderColor: "#c43c4a" },
  festText: { fontSize: 16, fontWeight: "700", textAlign: "center" },
  paidBadge: { fontSize: 11, color: "#2e7d32", fontWeight: "700", marginTop: 4, textAlign: "center" },
  // ── Payment Target Banner (only new style added) ──
  targetBanner: {
    backgroundColor: "#fff3cd",
    borderRadius: 8,
    paddingVertical: 4,
    paddingHorizontal: 10,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#f0c040",
  },
  targetBannerText: { fontSize: 11, fontWeight: "700", color: "#7a5c00" },
  // ─────────────────────────────────────────────────
  label: { fontSize: 13, fontWeight: "700", marginTop: 5 },
  value: { fontSize: 16, marginBottom: 10 },
  payButton: {
    marginTop: 50,
    backgroundColor: "#fff",
    paddingVertical: 16,
    paddingHorizontal: 60,
    borderRadius: 18,
    elevation: 4,
  },
  payText: { fontSize: 18, fontWeight: "700" },
  closeButton: {
    padding: 14,
    backgroundColor: "#fff",
    alignItems: "flex-end",
    borderBottomWidth: 1,
    borderColor: "#eee",
  },
  closeText: { fontSize: 16, color: "#c43c4a", fontWeight: "700" },
});
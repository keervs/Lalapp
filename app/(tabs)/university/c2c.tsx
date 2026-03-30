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
  View
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
  lastPaidAt?: any;
};

type TicketData = {
  festName: string;
  studentName: string;
  regNo: string;
  amountPaid: number;
  ticketId: string;
  date: string;
};

export default function C2C() {
  const [selectedFest, setSelectedFest] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [paymentHtml, setPaymentHtml] = useState("");
  const [fests, setFests] = useState<FestType[]>([]);
  const [contributions, setContributions] = useState<Record<string, ContributionType>>({});
  const [userInfo, setUserInfo] = useState<{ uid: string; regNo: string; name: string } | null>(null);

  // Ticket modal
  const [showTicket, setShowTicket] = useState(false);
  const [ticketData, setTicketData] = useState<TicketData | null>(null);

  // 1. Get current user info
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

  // 2. Live fests
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
          lastPaidAt: data.lastPaidAt,
        };
      });
      setContributions(map);
    });
    return () => unsub();
  }, [userInfo]);

  const openTicket = (fest: FestType) => {
    const contrib = contributions[fest.id];
    const paidDate = contrib?.lastPaidAt?.toDate
      ? contrib.lastPaidAt.toDate().toLocaleDateString("en-IN", {
          day: "numeric", month: "long", year: "numeric",
        })
      : new Date().toLocaleDateString("en-IN", {
          day: "numeric", month: "long", year: "numeric",
        });

    setTicketData({
      festName: fest.name,
      studentName: userInfo?.name ?? "",
      regNo: userInfo?.regNo ?? "",
      amountPaid: contrib?.totalPaid ?? fest.target,
      ticketId: `TKT-${fest.name.toUpperCase().replace(/\s/g, "")}-${(userInfo?.regNo ?? "").toUpperCase()}`,
      date: paidDate,
    });
    setShowTicket(true);
  };

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
        <!DOCTYPE html><html>
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <script src="https://sdk.cashfree.com/js/v3/cashfree.js"></script>
            <style>body { margin: 0; padding: 0; font-family: sans-serif; }</style>
          </head>
          <body>
            <script>
              const cashfree = Cashfree({ mode: "sandbox" });
              cashfree.checkout({ paymentSessionId: "${sessionId}", redirectTarget: "_self" });
            </script>
          </body>
        </html>`;
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
          const isFullyPaid = myPending <= 0 && myPaid > 0;

          return (
            <View key={fest.id} style={styles.festBlock}>
              <Pressable
                onPress={() => !isFullyPaid && setSelectedFest(fest.id)}
                style={[styles.festButton, isSelected && styles.selectedFest]}
              >
                <Text style={styles.festText}>{fest.name}</Text>
                {isFullyPaid && (
                  <Text style={styles.paidBadge}>✅ PAID</Text>
                )}
              </Pressable>

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

              {/* 🎟️ Ticket button — only when fully paid */}
              {isFullyPaid && (
                <Pressable
                  style={styles.ticketButton}
                  onPress={() => openTicket(fest)}
                >
                  <Text style={styles.ticketButtonText}>🎟️ YOUR TICKET</Text>
                </Pressable>
              )}
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

      {/* ── PAYMENT WEBVIEW MODAL ── */}
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

      {/* ── TICKET MODAL ── */}
      <Modal visible={showTicket} animationType="fade" transparent>
        <View style={styles.ticketOverlay}>
          <View style={styles.ticketWrapper}>

            {/* Top stub */}
            <View style={styles.ticketTop}>
              <Text style={styles.ticketAppName}>🎟 LALAPP</Text>
              <Text style={styles.ticketUnion}>LBSITW COLLEGE UNION 2025–26</Text>
            </View>

            {/* Perforated divider */}
            <View style={styles.perforation}>
              <View style={styles.perforationCircleLeft} />
              {Array.from({ length: 10 }).map((_, i) => (
                <View key={i} style={styles.perforationDash} />
              ))}
              <View style={styles.perforationCircleRight} />
            </View>

            {/* Ticket body */}
            <View style={styles.ticketBody}>
              <Text style={styles.ticketFestName}>{ticketData?.festName}</Text>

              <View style={styles.ticketDivider} />

              <View style={styles.ticketRow}>
                <Text style={styles.ticketLabel}>NAME</Text>
                <Text style={styles.ticketValue}>{ticketData?.studentName}</Text>
              </View>
              <View style={styles.ticketRow}>
                <Text style={styles.ticketLabel}>REG NO</Text>
                <Text style={styles.ticketValue}>{ticketData?.regNo}</Text>
              </View>
              <View style={styles.ticketRow}>
                <Text style={styles.ticketLabel}>PAID</Text>
                <Text style={styles.ticketValue}>₹{ticketData?.amountPaid}</Text>
              </View>
              <View style={styles.ticketRow}>
                <Text style={styles.ticketLabel}>DATE</Text>
                <Text style={styles.ticketValue}>{ticketData?.date}</Text>
              </View>

              <View style={styles.ticketDivider} />

              <Text style={styles.ticketId}>{ticketData?.ticketId}</Text>
            </View>
          </View>

          <Pressable
            style={styles.ticketCloseButton}
            onPress={() => setShowTicket(false)}
          >
            <Text style={styles.ticketCloseText}>✕ CLOSE</Text>
          </Pressable>
        </View>
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
  label: { fontSize: 13, fontWeight: "700", marginTop: 5 },
  value: { fontSize: 16, marginBottom: 10 },
  // Ticket button
  ticketButton: {
    backgroundColor: "#c43c4a",
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 10,
    marginTop: 6,
    elevation: 3,
  },
  ticketButtonText: { fontSize: 12, fontWeight: "700", color: "#fff" },
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

  // ── Ticket Modal ──
  ticketOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
  },
  ticketWrapper: {
    width: "82%",
    backgroundColor: "#fff",
    borderRadius: 16,
    overflow: "hidden",
    elevation: 12,
  },
  ticketTop: {
    backgroundColor: "#c43c4a",
    paddingVertical: 20,
    paddingHorizontal: 24,
    alignItems: "center",
  },
  ticketAppName: { fontSize: 20, fontWeight: "800", color: "#fff", letterSpacing: 2 },
  ticketUnion: { fontSize: 10, color: "rgba(255,255,255,0.8)", marginTop: 4, letterSpacing: 1 },
  perforation: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F6DDE0",
    paddingVertical: 2,
  },
  perforationCircleLeft: {
    width: 20, height: 20,
    borderRadius: 10,
    backgroundColor: "rgba(0,0,0,0.6)",
    marginLeft: -10,
  },
  perforationCircleRight: {
    width: 20, height: 20,
    borderRadius: 10,
    backgroundColor: "rgba(0,0,0,0.6)",
    marginRight: -10,
  },
  perforationDash: {
    flex: 1, height: 2,
    backgroundColor: "#ccc",
    marginHorizontal: 3,
  },
  ticketBody: {
    paddingVertical: 20,
    paddingHorizontal: 24,
    backgroundColor: "#fff",
  },
  ticketFestName: {
    fontSize: 22,
    fontWeight: "800",
    color: "#c43c4a",
    textAlign: "center",
    letterSpacing: 2,
    marginBottom: 14,
  },
  ticketDivider: {
    height: 1,
    backgroundColor: "#eee",
    marginVertical: 12,
  },
  ticketRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  ticketLabel: { fontSize: 11, fontWeight: "700", color: "#aaa", letterSpacing: 1 },
  ticketValue: { fontSize: 13, fontWeight: "700", color: "#222" },
  ticketId: {
    fontSize: 11,
    fontWeight: "700",
    color: "#aaa",
    textAlign: "center",
    letterSpacing: 1,
    marginTop: 4,
  },
  ticketCloseButton: {
    marginTop: 20,
    paddingVertical: 12,
    paddingHorizontal: 40,
    backgroundColor: "rgba(255,255,255,0.15)",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.4)",
  },
  ticketCloseText: { color: "#fff", fontWeight: "700", fontSize: 14, letterSpacing: 1 },
});
import axios from "axios";
import { useState } from "react";
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

const BACKEND_URL = "https://lalapp-production.up.railway.app";

type EventType = {
  id: string;
  name: string;
  target: number;
  paid: number;
};

export default function C2C() {
  const [selectedFest, setSelectedFest] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [paymentHtml, setPaymentHtml] = useState("");
  const [events, setEvents] = useState<EventType[]>([
    { id: "yagnadhruva", name: "YAGNADHRUVA", target: 2000, paid: 1500 },
    { id: "yavanika", name: "YAVANIKA", target: 200, paid: 50 },
  ]);

  const handlePay = async () => {
    if (!selectedFest) {
      alert("Select a fest first");
      return;
    }

    const fest = events.find((e) => e.id === selectedFest);
    if (!fest) return;

    const pending = fest.target - fest.paid;
    if (pending <= 0) {
      alert("This fest is already fully funded!");
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post(`${BACKEND_URL}/create-order`, {
        orderAmount: pending,
        festId: fest.id,
      });

      const sessionId = res.data.paymentSessionId;

      const html = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <script src="https://sdk.cashfree.com/js/v3/cashfree.js"></script>
            <style>
              body { margin: 0; padding: 0; font-family: sans-serif; }
            </style>
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
        source={require("./splash.png")}
        style={styles.logo}
        resizeMode="contain"
      />
      <Text style={styles.subText}>LBT COLLEGE UNION 2025–26</Text>
      <Text style={styles.header}>LALAPP</Text>

      <View style={styles.festRow}>
        {events.map((event) => {
          const pending = event.target - event.paid;
          const isSelected = selectedFest === event.id;

          return (
            <View key={event.id} style={styles.festBlock}>
              <Pressable
                onPress={() => setSelectedFest(event.id)}
                style={[styles.festButton, isSelected && styles.selectedFest]}
              >
                <Text style={styles.festText}>{event.name}</Text>
              </Pressable>
              <Text style={styles.label}>PENDING ⏱</Text>
              <Text style={styles.value}>₹{pending}</Text>
              <Text style={styles.label}>PAID 💰</Text>
              <Text style={styles.value}>₹{event.paid}</Text>
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
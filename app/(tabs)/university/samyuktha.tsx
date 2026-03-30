// samyuktha.tsx — Student View
import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
import { useEffect, useState } from "react";
import {
    Image,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from "react-native";
import { db } from "../../../lib/firebase";

type EventType = {
  id: string;
  name: string;
  venue: string;
  day: string;
  date: string;
  time: string;
  description: string;
  club: string;
  registrationLink: string;
  deadline: string;
};

export default function Samyuktha() {
  const [events, setEvents] = useState<EventType[]>([]);

  useEffect(() => {
    const q = query(
      collection(db, "events"),
      orderBy("createdAt", "desc")
    );
    const unsub = onSnapshot(q, (snap) => {
      const data: EventType[] = snap.docs.map((d) => ({
        id: d.id,
        name: d.data().name ?? "",
        venue: d.data().venue ?? "",
        day: d.data().day ?? "",
        date: d.data().date ?? "",
        time: d.data().time ?? "",
        description: d.data().description ?? "",
        club: d.data().club ?? "",
        registrationLink: d.data().registrationLink ?? "",
        deadline: d.data().deadline ?? "",
      }));
      setEvents(data);
    });
    return () => unsub();
  }, []);

  return (
    <View style={styles.container}>
      {/* ── Header ── */}
      <Image
        source={require("../../_assets/splash.png")}
        style={styles.logo}
        resizeMode="contain"
      />
      <Text style={styles.subText}>LBSITW COLLEGE UNION 2025–26</Text>
      <Text style={styles.header}>LALAPP</Text>
      <Text style={styles.samyuktha}>SAMYUKTHA</Text>

      {/* ── Pre-events heading ── */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Pre-events</Text>
      </View>

      {/* ── Event List ── */}
      <ScrollView style={styles.list} contentContainerStyle={{ paddingBottom: 40 }}>
        {events.length === 0 ? (
          <Text style={styles.empty}>No events yet.</Text>
        ) : (
          events.map((event) => (
            <View key={event.id} style={styles.card}>
              <View style={styles.cardLeft}>
                <Text style={styles.cardName}>{event.name}</Text>
                <Text style={styles.cardDate}>{event.date}</Text>
              </View>
            </View>
          ))
        )}
      </ScrollView>
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
  logo: { width: 100, height: 100, marginBottom: 6 },
  subText: { fontSize: 12, color: "#555", marginBottom: 2 },
  header: { fontSize: 22, fontWeight: "700", marginBottom: 2 },
  samyuktha: { fontSize: 28, fontWeight: "800", marginBottom: 16, letterSpacing: 1 },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    width: "88%",
    marginBottom: 16,
  },
  sectionTitle: { fontSize: 20, fontWeight: "700" },
  list: { width: "100%" },
  empty: { textAlign: "center", color: "#999", marginTop: 40, fontSize: 14 },
  card: {
    backgroundColor: "#fff",
    borderRadius: 14,
    marginHorizontal: 20,
    marginBottom: 12,
    paddingVertical: 16,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    elevation: 2,
  },
  cardLeft: { flex: 1 },
  cardName: { fontSize: 18, fontWeight: "700", marginBottom: 4 },
  cardDate: { fontSize: 13, color: "#777" },
});
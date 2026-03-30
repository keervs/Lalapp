import { useRouter } from "expo-router";
import { useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

export default function Home() {
  const router = useRouter();
  const [assocsOpen, setAssocsOpen] = useState(false);

  return (
    <View style={styles.root}>
      {/* Watermark */}
      <Text style={styles.watermark}>LBT</Text>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.logo}>LALAPP</Text>
          <Text style={styles.subText}>
            LBSITW COLLEGE UNION 2025–26
          </Text>
        </View>

        {/* Main Actions */}
        <Pressable
          style={styles.card}
          onPress={() => router.push("./book-a-behen")}
        >
          <Text style={styles.cardText}>BOOK A BEHEN</Text>
        </Pressable>

        <Pressable
          style={styles.card}
          onPress={() => router.push("./fests")}
        >
          <Text style={styles.cardText}>FESTS</Text>
        </Pressable>

        {/* ── ASSOCIATIONS with dropdown ── */}
        <Pressable
          style={[styles.card, assocsOpen && styles.cardActive]}
          onPress={() => setAssocsOpen((prev) => !prev)}
        >
          <View style={styles.cardRow}>
            <Text style={[styles.cardText, assocsOpen && styles.cardTextActive]}>
              ASSOCIATIONS
            </Text>
            <Text style={[styles.chevron, assocsOpen && styles.chevronOpen]}>
              ›
            </Text>
          </View>
        </Pressable>

        {/* Subtabs — slide in when open */}
        {assocsOpen && (
          <View style={styles.subList}>
            <Pressable
              style={styles.subCard}
              onPress={() => router.push("./samyuktha")}
            >
              <Text style={styles.subCardText}>SAMYUKTHA</Text>
            </Pressable>

            <Pressable
              style={styles.subCard}
              onPress={() => router.push("./advayra")}
            >
              <Text style={styles.subCardText}>ADVA(Y/R)A</Text>
            </Pressable>

            <Pressable
              style={[styles.subCard, { marginBottom: 0 }]}
              onPress={() => router.push("./sarga")}
            >
              <Text style={styles.subCardText}>SARGA</Text>
            </Pressable>
          </View>
        )}

        <Pressable
          style={styles.card}
          onPress={() => router.push("./c2c")}
        >
          <Text style={styles.cardText}>
            CONTRIBUTION TO COUPON
          </Text>
        </Pressable>

        {/* Explore More */}
        <Text style={styles.sectionTitle}>EXPLORE MORE</Text>

        <Pressable
          style={styles.card}
          onPress={() => router.push("../usdunion")}
        >
          <Text style={styles.cardText}>US THE UNION</Text>
        </Pressable>

        <Pressable
          style={styles.card}
          onPress={() => router.push("./newss")}
        >
          <Text style={styles.cardText}>NEW NEWS</Text>
        </Pressable>

        <Pressable
          style={styles.card}
          onPress={() => router.push("./preevnts")}
        >
          <Text style={styles.cardText}>PRE EVENTS</Text>
        </Pressable>

        {/* Footer */}
        <View style={styles.footer}>
          <Pressable onPress={() => router.push("../profile")}>
            <Text style={styles.footerLink}>Profile</Text>
          </Pressable>

          <Pressable onPress={() => router.push("../settings")}>
            <Text style={styles.footerLink}>Settings</Text>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#F6DDE0",
  },
  scroll: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  watermark: {
    position: "absolute",
    fontSize: 160,
    fontWeight: "900",
    color: "rgba(255,255,255,0.25)",
    top: "35%",
    alignSelf: "center",
    zIndex: 0,
  },
  header: {
    alignItems: "center",
    marginTop: 40,
    marginBottom: 30,
  },
  logo: {
    fontSize: 26,
    fontWeight: "700",
    letterSpacing: 2,
    color: "#000",
  },
  subText: {
    fontSize: 12,
    color: "#555",
    marginTop: 4,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 18,
    paddingVertical: 22,
    paddingHorizontal: 20,
    marginBottom: 18,
    elevation: 3,
  },
  cardActive: {
    backgroundColor: "#c43c4a",
    marginBottom: 0,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
  },
  cardRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  cardText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#000",
  },
  cardTextActive: {
    color: "#fff",
  },
  chevron: {
    fontSize: 22,
    fontWeight: "700",
    color: "#c43c4a",
    transform: [{ rotate: "0deg" }],
  },
  chevronOpen: {
    color: "#fff",
    transform: [{ rotate: "90deg" }],
  },

  // ── Subtabs ──
  subList: {
    backgroundColor: "#f9eaeb",
    borderLeftWidth: 3,
    borderRightWidth: 3,
    borderBottomWidth: 3,
    borderColor: "#c43c4a",
    borderBottomLeftRadius: 18,
    borderBottomRightRadius: 18,
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 14,
    marginBottom: 18,
  },
  subCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 18,
    marginBottom: 10,
    elevation: 1,
    borderLeftWidth: 4,
    borderLeftColor: "#c43c4a",
  },
  subCardText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#c43c4a",
    letterSpacing: 1,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginVertical: 20,
    color: "#000",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 30,
  },
  footerLink: {
    color: "#c43c4a",
    fontWeight: "600",
    fontSize: 14,
  },
});
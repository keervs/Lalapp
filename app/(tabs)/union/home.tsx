import { useRouter } from "expo-router";
import {
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from "react-native";

export default function Home() {
  const router = useRouter();

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
          onPress={() => router.push("../university/book-a-behen")}
        >
          <Text style={styles.cardText}>BOOK A BEHEN</Text>
        </Pressable>

        <Pressable
          style={styles.card}
          onPress={() => router.push("../university/fests")}
        >
          <Text style={styles.cardText}>FESTS</Text>
        </Pressable>

        <Pressable
          style={styles.card}
          onPress={() => router.push("./assocs")}
        >
          <Text style={styles.cardText}>ASSOCIATIONS</Text>
        </Pressable>

        <Pressable
          style={styles.card}
          onPress={() => router.push("./c2c2")}
        >
          <Text style={styles.cardText}>
            CONTRIBUTION TO COUPON
          </Text>
        </Pressable>

        {/* Explore More */}
        <Text style={styles.sectionTitle}>EXPLORE MORE</Text>

        <Pressable
          style={styles.card}
          onPress={() => router.push("../university/usdunion")}
        >
          <Text style={styles.cardText}>US THE UNION</Text>
        </Pressable>

        <Pressable
          style={styles.card}
          onPress={() => router.push("../university/newss")}
        >
          <Text style={styles.cardText}>NEW NEWS</Text>
        </Pressable>

        <Pressable
          style={styles.card}
          onPress={() => router.push("../university/preevnts")}
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

/* ================= STYLES ================= */

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
  cardText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#000",
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

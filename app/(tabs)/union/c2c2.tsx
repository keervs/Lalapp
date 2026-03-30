// C2C2.tsx — Unionite (Admin) View
import {
    collection,
    doc,
    onSnapshot,
    query,
    updateDoc,
    where,
} from "firebase/firestore";
import { useEffect, useState } from "react";
import {
    Image,
    Modal,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View
} from "react-native";
import { db } from "../../../lib/firebase";

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
  userId: string;
  regNo: string;
  name: string;
  festId: string;
  totalPaid: number;
  pending: number;
};

export default function C2C2() {
  const [fests, setFests] = useState<FestType[]>([]);
  const [contributions, setContributions] = useState<ContributionType[]>([]);
  const [selectedFest, setSelectedFest] = useState<string | null>(null);

  // Payment Target modal state
  const [showTargetModal, setShowTargetModal] = useState(false);
  const [targetFestId, setTargetFestId] = useState<string | null>(null);
  const [subTargetInput, setSubTargetInput] = useState("");
  const [deadlineInput, setDeadlineInput] = useState("");
  const [targetLoading, setTargetLoading] = useState(false);

  // 1. Live fests
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

  // 2. Live contributions for selected fest
  useEffect(() => {
    if (!selectedFest) return;
    const q = query(
      collection(db, "contributions"),
      where("festId", "==", selectedFest)
    );
    const unsub = onSnapshot(q, (snap) => {
      const data: ContributionType[] = snap.docs.map((d) => ({
        userId: d.data().userId,
        regNo: d.data().regNo,
        name: d.data().name,
        festId: d.data().festId,
        totalPaid: d.data().totalPaid ?? 0,
        pending: d.data().pending ?? 0,
      }));
      setContributions(data);
    });
    return () => unsub();
  }, [selectedFest]);

  const openTargetModal = (festId: string) => {
    const fest = fests.find((f) => f.id === festId);
    if (fest) {
      setSubTargetInput(fest.subTarget ? String(fest.subTarget) : "");
      setDeadlineInput(fest.deadline ?? "");
    }
    setTargetFestId(festId);
    setShowTargetModal(true);
  };

  const handleSaveTarget = async () => {
    if (!targetFestId) return;
    if (!subTargetInput || !deadlineInput) {
      alert("Please fill both sub-target and deadline.");
      return;
    }
    setTargetLoading(true);
    try {
      await updateDoc(doc(db, "fests", targetFestId), {
        subTarget: Number(subTargetInput),
        deadline: deadlineInput,
        installmentAmount: Number(subTargetInput),
      });
      setShowTargetModal(false);
      alert("Payment target set! Students will see this immediately ✅");
    } catch (err) {
      console.log(err);
      alert("Failed to save target.");
    } finally {
      setTargetLoading(false);
    }
  };

  const selectedFestData = fests.find((f) => f.id === selectedFest);

  return (
    <View style={styles.container}>
      <Image
        source={require("../../_assets/splash.png")}
        style={styles.logo}
        resizeMode="contain"
      />
      <Text style={styles.subText}>LBT COLLEGE UNION 2025–26</Text>
      <Text style={styles.header}>LALAPP</Text>

      {/* ── PAYMENT TARGET BUTTON ── */}
      <Pressable
        style={styles.paymentTargetButton}
        onPress={() => {
          if (!selectedFest) {
            alert("Select a fest first to set its target.");
            return;
          }
          openTargetModal(selectedFest);
        }}
      >
        <Text style={styles.paymentTargetText}>🎯 PAYMENT TARGET</Text>
      </Pressable>

      {/* Fest selector row */}
      <View style={styles.festRow}>
        {fests.map((fest) => {
          const isSelected = selectedFest === fest.id;
          const progress = fest.target > 0
            ? Math.min(100, Math.round((fest.totalPaid / fest.target) * 100))
            : 0;

          return (
            <View key={fest.id} style={styles.festBlock}>
              <Pressable
                onPress={() => setSelectedFest(fest.id)}
                style={[styles.festButton, isSelected && styles.selectedFest]}
              >
                <Text style={styles.festText}>{fest.name}</Text>
              </Pressable>

              {/* Show active target if set */}
              {fest.subTarget && fest.deadline ? (
                <View style={styles.targetBadge}>
                  <Text style={styles.targetBadgeText}>
                    🎯 ₹{fest.subTarget} by {fest.deadline}
                  </Text>
                </View>
              ) : null}

              <Text style={styles.label}>TOTAL PAID 💰</Text>
              <Text style={styles.value}>₹{fest.totalPaid}</Text>
              <Text style={styles.label}>TARGET 🏁</Text>
              <Text style={styles.value}>₹{fest.target}</Text>
              <Text style={styles.label}>PROGRESS</Text>
              <Text style={styles.value}>{progress}%</Text>
            </View>
          );
        })}
      </View>

      {/* Contributions drill-down */}
      {selectedFest && (
        <View style={styles.drillDown}>
          <Text style={styles.drillTitle}>
            {selectedFestData?.name} — WHO PAID
          </Text>
          <ScrollView style={{ maxHeight: 200 }}>
            {contributions.length === 0 ? (
              <Text style={styles.noData}>No payments yet.</Text>
            ) : (
              contributions.map((c) => (
                <View key={c.userId} style={styles.contributionRow}>
                  <Text style={styles.contribName}>{c.name}</Text>
                  <Text style={styles.contribReg}>{c.regNo}</Text>
                  <Text style={styles.contribPaid}>₹{c.totalPaid} paid</Text>
                  <Text style={styles.contribPending}>₹{c.pending} pending</Text>
                </View>
              ))
            )}
          </ScrollView>
        </View>
      )}

      {/* ── PAYMENT TARGET MODAL ── */}
      <Modal visible={showTargetModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>🎯 SET PAYMENT TARGET</Text>
            <Text style={styles.modalSub}>
              {fests.find((f) => f.id === targetFestId)?.name}
            </Text>

            <Text style={styles.inputLabel}>Sub-Target Amount (₹)</Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              placeholder="e.g. 500"
              value={subTargetInput}
              onChangeText={setSubTargetInput}
            />

            <Text style={styles.inputLabel}>Deadline</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. April 15, 2026"
              value={deadlineInput}
              onChangeText={setDeadlineInput}
            />

            <Text style={styles.modalNote}>
              This sets the installment amount students pay per session and shows a deadline banner on their screen.
            </Text>

            <Pressable
              style={[styles.saveButton, targetLoading && { opacity: 0.6 }]}
              onPress={handleSaveTarget}
              disabled={targetLoading}
            >
              <Text style={styles.saveText}>
                {targetLoading ? "SAVING..." : "SAVE TARGET"}
              </Text>
            </Pressable>

            <Pressable
              style={styles.cancelButton}
              onPress={() => setShowTargetModal(false)}
            >
              <Text style={styles.cancelText}>✕ Cancel</Text>
            </Pressable>
          </View>
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
  subText: { fontSize: 12, color: "#555", marginBottom: 16 },

  // ── Payment Target Button ──
  paymentTargetButton: {
    backgroundColor: "#c43c4a",
    paddingVertical: 10,
    paddingHorizontal: 32,
    borderRadius: 12,
    marginBottom: 24,
    elevation: 4,
  },
  paymentTargetText: { fontSize: 14, fontWeight: "700", color: "#fff" },

  // ── Fest Row (same layout as C2C.tsx) ──
  festRow: { flexDirection: "row", justifyContent: "center", width: "100%" },
  festBlock: { alignItems: "center", flex: 1 },
  festButton: { paddingVertical: 6, paddingHorizontal: 10, marginBottom: 12 },
  selectedFest: { borderBottomWidth: 2, borderColor: "#c43c4a" },
  festText: { fontSize: 16, fontWeight: "700", textAlign: "center" },
  targetBadge: {
    backgroundColor: "#fff3cd",
    borderRadius: 8,
    paddingVertical: 3,
    paddingHorizontal: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#f0c040",
  },
  targetBadgeText: { fontSize: 10, fontWeight: "700", color: "#7a5c00" },
  label: { fontSize: 13, fontWeight: "700", marginTop: 5 },
  value: { fontSize: 16, marginBottom: 10 },

  // ── Drill-down ──
  drillDown: {
    width: "90%",
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 16,
    marginTop: 20,
    elevation: 3,
  },
  drillTitle: { fontSize: 13, fontWeight: "700", marginBottom: 10, color: "#c43c4a" },
  noData: { fontSize: 13, color: "#888", textAlign: "center" },
  contributionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderColor: "#f0f0f0",
    flexWrap: "wrap",
  },
  contribName: { fontSize: 12, fontWeight: "700", width: "30%" },
  contribReg: { fontSize: 11, color: "#666", width: "25%" },
  contribPaid: { fontSize: 12, color: "#2e7d32", fontWeight: "700", width: "20%" },
  contribPending: { fontSize: 12, color: "#c43c4a", fontWeight: "700", width: "22%" },

  // ── Target Modal ──
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalBox: {
    width: "85%",
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 24,
    elevation: 10,
  },
  modalTitle: { fontSize: 18, fontWeight: "700", textAlign: "center", marginBottom: 4 },
  modalSub: { fontSize: 13, color: "#c43c4a", fontWeight: "700", textAlign: "center", marginBottom: 20 },
  inputLabel: { fontSize: 12, fontWeight: "700", color: "#555", marginBottom: 4 },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 14,
    fontSize: 14,
    marginBottom: 14,
    backgroundColor: "#fafafa",
  },
  modalNote: {
    fontSize: 11,
    color: "#888",
    textAlign: "center",
    marginBottom: 20,
    lineHeight: 16,
  },
  saveButton: {
    backgroundColor: "#c43c4a",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 10,
  },
  saveText: { fontSize: 15, fontWeight: "700", color: "#fff" },
  cancelButton: { alignItems: "center", paddingVertical: 8 },
  cancelText: { fontSize: 14, color: "#c43c4a", fontWeight: "700" },
});
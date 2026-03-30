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

export default function C2C2() {
  const [fests, setFests] = useState<FestType[]>([]);
  const [contributions, setContributions] = useState<ContributionType[]>([]);
  const [selectedFest, setSelectedFest] = useState<string | null>(null);

  // Merged PUT TARGET modal
  const [showTargetModal, setShowTargetModal] = useState(false);
  const [targetFestId, setTargetFestId] = useState<string | null>(null);
  const [subTargetInput, setSubTargetInput] = useState("");
  const [deadlineInput, setDeadlineInput] = useState("");
  const [targetLoading, setTargetLoading] = useState(false);

  // Ticket modal
  const [showTicket, setShowTicket] = useState(false);
  const [ticketData, setTicketData] = useState<TicketData | null>(null);

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
        lastPaidAt: d.data().lastPaidAt,
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

  const openTicket = (contrib: ContributionType) => {
    const fest = fests.find((f) => f.id === contrib.festId);
    const paidDate = contrib?.lastPaidAt?.toDate
      ? contrib.lastPaidAt.toDate().toLocaleDateString("en-IN", {
          day: "numeric", month: "long", year: "numeric",
        })
      : new Date().toLocaleDateString("en-IN", {
          day: "numeric", month: "long", year: "numeric",
        });

    setTicketData({
      festName: fest?.name ?? contrib.festId,
      studentName: contrib.name,
      regNo: contrib.regNo,
      amountPaid: contrib.totalPaid,
      ticketId: `TKT-${(fest?.name ?? contrib.festId).toUpperCase().replace(/\s/g, "")}-${contrib.regNo.toUpperCase()}`,
      date: paidDate,
    });
    setShowTicket(true);
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

      {/* ── MERGED PUT TARGET BUTTON ── */}
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
        <Text style={styles.paymentTargetText}>🎯 PUT TARGET</Text>
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
          <ScrollView style={{ maxHeight: 220 }}>
            {contributions.length === 0 ? (
              <Text style={styles.noData}>No payments yet.</Text>
            ) : (
              contributions.map((c) => {
                const isFullyPaid = c.pending <= 0 && c.totalPaid > 0;
                return (
                  <View key={c.userId} style={styles.contributionRow}>
                    <View style={styles.contribInfo}>
                      <Text style={styles.contribName}>{c.name}</Text>
                      <Text style={styles.contribReg}>{c.regNo}</Text>
                      <Text style={styles.contribPaid}>₹{c.totalPaid} paid</Text>
                      <Text style={styles.contribPending}>₹{c.pending} pending</Text>
                    </View>
                    {/* Ticket button for fully paid students */}
                    {isFullyPaid && (
                      <Pressable
                        style={styles.adminTicketButton}
                        onPress={() => openTicket(c)}
                      >
                        <Text style={styles.adminTicketText}>🎟️</Text>
                      </Pressable>
                    )}
                  </View>
                );
              })
            )}
          </ScrollView>
        </View>
      )}

      {/* ── PUT TARGET MODAL ── */}
      <Modal visible={showTargetModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>🎯 PAYMENT TARGET</Text>
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
  subText: { fontSize: 12, color: "#555", marginBottom: 16 },

  // PUT TARGET button
  paymentTargetButton: {
    backgroundColor: "#c43c4a",
    paddingVertical: 10,
    paddingHorizontal: 32,
    borderRadius: 12,
    marginBottom: 24,
    elevation: 4,
  },
  paymentTargetText: { fontSize: 14, fontWeight: "700", color: "#fff" },

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

  // Drill-down
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
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderColor: "#f0f0f0",
  },
  contribInfo: { flex: 1, flexDirection: "row", flexWrap: "wrap" },
  contribName: { fontSize: 12, fontWeight: "700", width: "35%" },
  contribReg: { fontSize: 11, color: "#666", width: "30%" },
  contribPaid: { fontSize: 12, color: "#2e7d32", fontWeight: "700", width: "35%" },
  contribPending: { fontSize: 12, color: "#c43c4a", fontWeight: "700", width: "35%" },
  adminTicketButton: {
    backgroundColor: "#c43c4a",
    borderRadius: 8,
    padding: 8,
    marginLeft: 8,
  },
  adminTicketText: { fontSize: 16 },

  // PUT TARGET modal
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
  modalNote: { fontSize: 11, color: "#888", textAlign: "center", marginBottom: 20, lineHeight: 16 },
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
  ticketDivider: { height: 1, backgroundColor: "#eee", marginVertical: 12 },
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
// samyukthaa.tsx — Admin (Unionite) View
import {
    addDoc,
    collection,
    deleteDoc,
    doc,
    onSnapshot,
    serverTimestamp,
    updateDoc,
} from "firebase/firestore";
import { useEffect, useState } from "react";
import {
    Image,
    Modal,
    Pressable,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
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

const EMPTY_FORM = {
  name: "",
  venue: "",
  day: "",
  date: "",
  time: "",
  description: "",
  club: "",
  registrationLink: "",
  deadline: "",
};

export default function Samyukthaa() {
  const [events, setEvents] = useState<EventType[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteInput, setDeleteInput] = useState("");
  const [loading, setLoading] = useState(false);

  // ── Live events — NO orderBy to avoid index crash ──
  useEffect(() => {
    const unsub = onSnapshot(collection(db, "events"), (snap) => {
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

  const handleCreate = async () => {
    if (!form.name || !form.date) {
      alert("Name and Date are required.");
      return;
    }
    setLoading(true);
    try {
      await addDoc(collection(db, "events"), {
        ...form,
        createdAt: serverTimestamp(),
      });
      setShowCreate(false);
      setForm({ ...EMPTY_FORM });
      alert("Event created ✅");
    } catch (err) {
      console.error(err);
      alert("Failed to create event.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    const match = events.find(
      (e) => e.name.trim().toLowerCase() === deleteInput.trim().toLowerCase()
    );
    if (!match) {
      alert("Event name not found. Please type the exact name.");
      return;
    }
    setLoading(true);
    try {
      await deleteDoc(doc(db, "events", match.id));
      setShowDelete(false);
      setDeleteInput("");
      alert("Event deleted ✅");
    } catch (err) {
      console.error(err);
      alert("Failed to delete event.");
    } finally {
      setLoading(false);
    }
  };

  const openEdit = (event: EventType) => {
    setForm({
      name: event.name,
      venue: event.venue,
      day: event.day,
      date: event.date,
      time: event.time,
      description: event.description,
      club: event.club,
      registrationLink: event.registrationLink,
      deadline: event.deadline,
    });
    setEditingId(event.id);
    setShowEdit(true);
  };

  const handleEdit = async () => {
    if (!editingId) return;
    if (!form.name || !form.date) {
      alert("Name and Date are required.");
      return;
    }
    setLoading(true);
    try {
      await updateDoc(doc(db, "events", editingId), { ...form });
      setShowEdit(false);
      setEditingId(null);
      setForm({ ...EMPTY_FORM });
      alert("Event updated ✅");
    } catch (err) {
      console.error(err);
      alert("Failed to update event.");
    } finally {
      setLoading(false);
    }
  };

  const Field = ({
    placeholder,
    value,
    onChangeText,
    multiline = false,
  }: {
    placeholder: string;
    value: string;
    onChangeText: (t: string) => void;
    multiline?: boolean;
  }) => (
    <TextInput
      style={[styles.input, multiline && { height: 80, textAlignVertical: "top" }]}
      placeholder={placeholder}
      placeholderTextColor="#aaa"
      value={value}
      onChangeText={onChangeText}
      multiline={multiline}
    />
  );

  const EventForm = ({
    onSubmit,
    submitLabel,
  }: {
    onSubmit: () => void;
    submitLabel: string;
  }) => (
    <ScrollView showsVerticalScrollIndicator={false}>
      <Field placeholder="Name" value={form.name} onChangeText={(t) => setForm({ ...form, name: t })} />
      <Field placeholder="Venue" value={form.venue} onChangeText={(t) => setForm({ ...form, venue: t })} />
      <Field placeholder="Day (e.g. Monday)" value={form.day} onChangeText={(t) => setForm({ ...form, day: t })} />
      <Field placeholder="Date (e.g. May 15, 2025)" value={form.date} onChangeText={(t) => setForm({ ...form, date: t })} />
      <Field placeholder="Time (e.g. 10:00 AM)" value={form.time} onChangeText={(t) => setForm({ ...form, time: t })} />
      <Field placeholder="Description" value={form.description} onChangeText={(t) => setForm({ ...form, description: t })} multiline />
      <Field placeholder="Club" value={form.club} onChangeText={(t) => setForm({ ...form, club: t })} />
      <Field placeholder="Registration Link" value={form.registrationLink} onChangeText={(t) => setForm({ ...form, registrationLink: t })} />
      <Field placeholder="Deadline (e.g. May 10, 2025)" value={form.deadline} onChangeText={(t) => setForm({ ...form, deadline: t })} />
      <Pressable
        style={[styles.submitButton, loading && { opacity: 0.6 }]}
        onPress={onSubmit}
        disabled={loading}
      >
        <Text style={styles.submitText}>{loading ? "SAVING..." : submitLabel}</Text>
      </Pressable>
    </ScrollView>
  );

  return (
    <View style={styles.container}>
      <Image
        source={require("../../_assets/splash.png")}
        style={styles.logo}
        resizeMode="contain"
      />
      <Text style={styles.subText}>LBSITW COLLEGE UNION 2025–26</Text>
      <Text style={styles.header}>LALAPP</Text>
      <Text style={styles.samyuktha}>SAMYUKTHA</Text>

      {/* ── Pre-events row with + and - ── */}
      <View style={styles.sectionHeader}>
        <Pressable
          style={styles.iconButton}
          onPress={() => { setDeleteInput(""); setShowDelete(true); }}
        >
          <Text style={styles.iconButtonText}>−</Text>
        </Pressable>

        <Text style={styles.sectionTitle}>Pre-events</Text>

        <Pressable
          style={styles.iconButton}
          onPress={() => { setForm({ ...EMPTY_FORM }); setShowCreate(true); }}
        >
          <Text style={styles.iconButtonText}>+</Text>
        </Pressable>
      </View>

      {/* ── Event List ── */}
      <ScrollView style={styles.list} contentContainerStyle={{ paddingBottom: 40 }}>
        {events.length === 0 ? (
          <Text style={styles.empty}>No events yet. Tap + to create one.</Text>
        ) : (
          events.map((event) => (
            <View key={event.id} style={styles.card}>
              <View style={styles.cardLeft}>
                <Text style={styles.cardName}>{event.name}</Text>
                <Text style={styles.cardDate}>{event.date}</Text>
              </View>
              <Pressable style={styles.editButton} onPress={() => openEdit(event)}>
                <Text style={styles.editIcon}>✏️</Text>
                <Text style={styles.editLabel}>Edit</Text>
              </Pressable>
            </View>
          ))
        )}
      </ScrollView>

      {/* ── CREATE MODAL ── */}
      <Modal visible={showCreate} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <SafeAreaView style={styles.modalBox}>
            <Text style={styles.modalTitle}>Create New Event</Text>
            <EventForm onSubmit={handleCreate} submitLabel="CREATE" />
            <Pressable style={styles.cancelButton} onPress={() => setShowCreate(false)}>
              <Text style={styles.cancelText}>Cancel</Text>
            </Pressable>
          </SafeAreaView>
        </View>
      </Modal>

      {/* ── DELETE MODAL ── */}
      <Modal visible={showDelete} animationType="fade" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.deleteBox}>
            <Text style={styles.modalTitle}>Delete Event</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter Event Name to Delete"
              placeholderTextColor="#aaa"
              value={deleteInput}
              onChangeText={setDeleteInput}
            />
            <Pressable
              style={[styles.deleteConfirmButton, loading && { opacity: 0.6 }]}
              onPress={handleDelete}
              disabled={loading}
            >
              <Text style={styles.submitText}>{loading ? "DELETING..." : "Delete"}</Text>
            </Pressable>
            <Pressable style={styles.cancelButton} onPress={() => setShowDelete(false)}>
              <Text style={styles.cancelText}>Cancel</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      {/* ── EDIT MODAL ── */}
      <Modal visible={showEdit} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <SafeAreaView style={styles.modalBox}>
            <Text style={styles.modalTitle}>Edit Event</Text>
            <EventForm onSubmit={handleEdit} submitLabel="SAVE CHANGES" />
            <Pressable style={styles.cancelButton} onPress={() => setShowEdit(false)}>
              <Text style={styles.cancelText}>Cancel</Text>
            </Pressable>
          </SafeAreaView>
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
  logo: { width: 100, height: 100, marginBottom: 6 },
  subText: { fontSize: 12, color: "#555", marginBottom: 2 },
  header: { fontSize: 22, fontWeight: "700", marginBottom: 2 },
  samyuktha: { fontSize: 28, fontWeight: "800", marginBottom: 16, letterSpacing: 1 },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "88%",
    marginBottom: 16,
  },
  sectionTitle: { fontSize: 20, fontWeight: "700" },
  iconButton: {
    backgroundColor: "#fff",
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    elevation: 3,
  },
  iconButtonText: { fontSize: 24, fontWeight: "700", color: "#c43c4a", lineHeight: 28 },
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
  editButton: { alignItems: "center", paddingLeft: 12 },
  editIcon: { fontSize: 18 },
  editLabel: { fontSize: 11, color: "#c43c4a", fontWeight: "700" },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalBox: {
    width: "90%",
    maxHeight: "85%",
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 24,
    elevation: 10,
  },
  deleteBox: {
    width: "85%",
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 24,
    elevation: 10,
  },
  modalTitle: { fontSize: 18, fontWeight: "700", textAlign: "center", marginBottom: 20 },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 14,
    fontSize: 14,
    marginBottom: 12,
    backgroundColor: "#fafafa",
    color: "#333",
  },
  submitButton: {
    backgroundColor: "#4a7c3f",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 4,
    marginBottom: 8,
  },
  submitText: { fontSize: 15, fontWeight: "700", color: "#fff" },
  deleteConfirmButton: {
    backgroundColor: "#c43c4a",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 8,
  },
  cancelButton: { alignItems: "center", paddingVertical: 10 },
  cancelText: { fontSize: 14, color: "#c43c4a", fontWeight: "700" },
});
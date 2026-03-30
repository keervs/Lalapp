// backend/server.js
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const axios = require("axios");
const admin = require("firebase-admin");

// ── Firebase Admin Init ──────────────────────────────────────────────
admin.initializeApp({
  credential: admin.credential.cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
  }),
});

const db = admin.firestore();
const app = express();

app.use(cors());
app.use(express.json());

// ── Health Check ─────────────────────────────────────────────────────
app.get("/", (req, res) => {
  res.send("LalApp backend is running ✅");
});

// ── POST /create-order ───────────────────────────────────────────────
// Called by C2C.tsx when student taps PAY
app.post("/create-order", async (req, res) => {
  const { orderAmount, festId, userId, regNo, name } = req.body;

  if (!orderAmount || !festId || !userId || !regNo) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    // Check if user already fully paid for this fest
    const contribRef = db
      .collection("contributions")
      .doc(`${festId}_${regNo}`);
    const contribSnap = await contribRef.get();

    if (contribSnap.exists) {
      const data = contribSnap.data();
      if (data.pending <= 0) {
        return res.status(400).json({ error: "Already fully paid for this fest" });
      }
    }

    // Create Cashfree order
    const orderId = `ORDER_${Date.now()}_${userId.slice(0, 6)}`;

    const cashfreeRes = await axios.post(
      "https://sandbox.cashfree.com/pg/orders",
      {
        order_id: orderId,
        order_amount: orderAmount,
        order_currency: "INR",
        customer_details: {
          customer_id: userId,
          customer_name: name ?? regNo,
          customer_email: `${regNo}@lalapp.com`,
          customer_phone: "9999999999", // placeholder — update if you collect phone
        },
        order_meta: {
          return_url: `${process.env.BACKEND_URL}/payment-success?order_id={order_id}`,
        },
      },
      {
        headers: {
          "x-client-id": process.env.CASHFREE_APP_ID,
          "x-client-secret": process.env.CASHFREE_SECRET_KEY,
          "x-api-version": "2023-08-01",
          "Content-Type": "application/json",
        },
      }
    );

    const paymentSessionId = cashfreeRes.data.payment_session_id;

    // Store PENDING payment record
    await db.collection("payments").doc(orderId).set({
      orderId,
      userId,
      regNo,
      name: name ?? regNo,
      festId,
      amount: orderAmount,
      status: "PENDING",
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      paidAt: null,
    });

    return res.json({ paymentSessionId, orderId });
  } catch (err) {
    console.error("create-order error:", err?.response?.data ?? err.message);
    return res.status(500).json({ error: "Failed to create order" });
  }
});

// ── GET /payment-success ─────────────────────────────────────────────
// Cashfree redirects here after payment — WebView intercepts this URL
app.get("/payment-success", (req, res) => {
  res.send(`
    <html>
      <body style="font-family:sans-serif;text-align:center;padding-top:80px;">
        <h2>Payment Successful ✅</h2>
        <p>You can close this window.</p>
      </body>
    </html>
  `);
});

// ── POST /webhook ────────────────────────────────────────────────────
// Cashfree calls this when payment status changes
app.post("/webhook", async (req, res) => {
  try {
    const event = req.body;
    const eventType = event?.type;

    if (eventType !== "PAYMENT_SUCCESS_WEBHOOK") {
      // Not a success event — acknowledge and ignore
      return res.status(200).json({ received: true });
    }

    const orderId = event?.data?.order?.order_id;
    const paidAmount = event?.data?.payment?.payment_amount;

    if (!orderId) {
      return res.status(400).json({ error: "Missing order_id in webhook" });
    }

    // 1. Fetch the PENDING payment record
    const paymentRef = db.collection("payments").doc(orderId);
    const paymentSnap = await paymentRef.get();

    if (!paymentSnap.exists) {
      console.warn(`Webhook: no payment record found for ${orderId}`);
      return res.status(404).json({ error: "Payment record not found" });
    }

    const payment = paymentSnap.data();
    const { userId, regNo, name, festId, amount } = payment;
    const actualAmount = paidAmount ?? amount;

    // Guard: don't double-process
    if (payment.status === "SUCCESS") {
      console.log(`Webhook: ${orderId} already processed, skipping.`);
      return res.status(200).json({ received: true });
    }

    // ── 2. Mark payment as SUCCESS ───────────────────────────────────
    await paymentRef.update({
      status: "SUCCESS",
      paidAt: admin.firestore.FieldValue.serverTimestamp(),
      amount: actualAmount,
    });

    // ── 3. Fetch fest target ─────────────────────────────────────────
    const festRef = db.collection("fests").doc(festId);
    const festSnap = await festRef.get();

    if (!festSnap.exists) {
      console.warn(`Webhook: fest ${festId} not found`);
      return res.status(404).json({ error: "Fest not found" });
    }

    const fest = festSnap.data();
    const festTarget = fest.target ?? 0;

    // ── 4. Update contributions/{festId}_{regNo} ─────────────────────
    // This is the per-student, per-fest paid/pending tracker
    const contribRef = db
      .collection("contributions")
      .doc(`${festId}_${regNo}`);
    const contribSnap = await contribRef.get();

    const prevPaid = contribSnap.exists ? (contribSnap.data().totalPaid ?? 0) : 0;
    const newTotalPaid = prevPaid + actualAmount;
    const newPending = Math.max(0, festTarget - newTotalPaid);

    await contribRef.set(
      {
        userId,
        regNo,
        name,
        festId,
        totalPaid: newTotalPaid,
        pending: newPending,
        lastPaidAt: admin.firestore.FieldValue.serverTimestamp(),
      },
      { merge: true } // merge so we don't wipe existing fields on first write
    );

    // ── 5. Increment fests/{festId}.totalPaid ────────────────────────
    // This is the overall class fund progress seen by admin
    await festRef.update({
      totalPaid: admin.firestore.FieldValue.increment(actualAmount),
    });

    console.log(
      `✅ Webhook processed: ${orderId} | ${name} (${regNo}) paid ₹${actualAmount} for ${festId} | totalPaid now ₹${newTotalPaid} | pending ₹${newPending}`
    );

    return res.status(200).json({ received: true });
  } catch (err) {
    console.error("Webhook error:", err.message);
    return res.status(500).json({ error: "Webhook processing failed" });
  }
});

// ── Start Server ─────────────────────────────────────────────────────
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`LalApp backend running on port ${PORT}`);
});
const functions = require("firebase-functions");
const admin = require("firebase-admin");
const Razorpay = require("razorpay");
const crypto = require("crypto");

admin.initializeApp();

const razorpay = new Razorpay({
  key_id: "rzp_test_SVvcpPGvXkgdin",
  key_secret: "Bs4I3bHf4Dl083JkhjMngs6O",
});

// 🔹 CREATE ORDER
exports.createOrder = functions.https.onCall(async (data, context) => {
  const { amount } = data;

  const options = {
    amount: amount * 100,
    currency: "INR",
    receipt: "receipt_" + Date.now(),
  };

  const order = await razorpay.orders.create(options);
  return order;
});

// 🔹 VERIFY PAYMENT
exports.verifyPayment = functions.https.onCall(async (data, context) => {
  const {
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
    festId,
    amount,
  } = data;

  const body = razorpay_order_id + "|" + razorpay_payment_id;

  const expectedSignature = crypto
    .createHmac("sha256", "YOUR_KEY_SECRET")
    .update(body)
    .digest("hex");

  if (expectedSignature !== razorpay_signature) {
    throw new functions.https.HttpsError(
      "permission-denied",
      "Invalid signature"
    );
  }

  const db = admin.firestore();

  await db.collection("fests").doc(festId).update({
    currentAmount: admin.firestore.FieldValue.increment(amount),
  });

  await db.collection("fests")
    .doc(festId)
    .collection("contributions")
    .add({
      userId: context.auth.uid,
      amount,
      paymentId: razorpay_payment_id,
      timestamp: new Date(),
    });

  return { success: true };
});
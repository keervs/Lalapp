const express = require("express");
const axios = require("axios");
const cors = require("cors");
require("dotenv").config();

const app = express();
app.use(cors()); // ← allows your app to call the backend
app.use(express.json());

// Health check — Railway needs this
app.get("/", (req, res) => {
  res.send("LalApp Backend Running ✅");
});

app.post("/create-order", async (req, res) => {
  try {
    const { orderAmount, festId } = req.body;

    const response = await axios.post(
      "https://sandbox.cashfree.com/pg/orders",
      {
        order_id: `order_${festId}_${Date.now()}`,
        order_amount: orderAmount,
        order_currency: "INR",
        customer_details: {
          customer_id: "user_123",
          customer_name: "Test User",
          customer_email: "test@test.com",
          customer_phone: "9999999999",
        },
        order_meta: {
          return_url: `${process.env.BACKEND_URL}/payment-success`,
        },
      },
      {
        headers: {
          "x-client-id": process.env.CASHFREE_APP_ID,
          "x-client-secret": process.env.CASHFREE_SECRET_KEY,
          "x-api-version": "2022-09-01",
          "Content-Type": "application/json",
        },
      }
    );

    res.json({
      paymentSessionId: response.data.payment_session_id,
    });

  } catch (err) {
    console.log(err.response?.data || err.message);
    res.status(500).send("Error creating order");
  }
});

app.get("/payment-success", (req, res) => {
  res.send("<h1>Payment Successful! ✅ You can close this tab.</h1>");
});

app.post("/webhook", (req, res) => {
  const data = req.body;
  if (data.type === "PAYMENT_SUCCESS_WEBHOOK") {
    console.log("Payment SUCCESS:", data.data.order.order_id);
    // 🔥 UPDATE FIRESTORE HERE LATER
  }
  res.sendStatus(200);
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, "0.0.0.0", () => console.log(`Server running on ${PORT}`));
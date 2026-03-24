import express from "express";
import midtransClient from "midtrans-client";
const router = express.Router();

const snap = new midtransClient.Snap({
  isProduction: false,
  serverKey: "Mid-server-DBPNAdBY62uOiUXvrVnr4RzK",
});

// POST /api/payment/create-transaction
router.post("/create-transaction", async (req, res) => {
  try {
    const { orderId, amount, customer } = req.body;

    const parameter = {
      transaction_details: {
        order_id: orderId,
        gross_amount: amount,
      },
      customer_details: {
        first_name: customer.name,
        email: customer.email,
      },

    callbacks: {
        finish: "http://localhost:3000/profile",
        error: "http://localhost:3000/payment-failed",
        pending: "http://localhost:3000/payment-pending",
    },
    };

    const transaction = await snap.createTransaction(parameter);

    res.json({
      token: transaction.token,
    });
  } catch (error) {
    console.error("Midtrans Error:", error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
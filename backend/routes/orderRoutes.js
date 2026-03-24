import express from "express";
import Order from "../models/Order.js";

const router = express.Router();
const POPULATE_FIELDS = ['AddressId', 'DeliveryId', 'ProductId', 'AdministrationFee', 'ShopId'];

// 📦 Buat Order Baru (POST /api/orders)
router.post("/", async (req, res) => {
  try {
    const order = new Order(req.body);
    await order.save();
    res.status(201).json(order);
  } catch (err) { res.status(400).json({ error: err.message }); }
});

// 📜 Ambil Semua Order (GET /api/orders)
router.get("/", async (req, res) => {
  try {
    const orders = await Order.find().populate(POPULATE_FIELDS);
    res.json(orders);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// 🔎 Ambil Order Berdasarkan ID (GET /api/orders/:id)
router.get("/:id", async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate(POPULATE_FIELDS);
    if (!order) return res.status(404).json({ error: "Order not found" });
    res.json(order);
  } catch (err) { res.status(400).json({ error: err.message }); }
});

// 📝 Update Order (PUT /api/orders/:id)
router.put("/:id", async (req, res) => {
  try {
    const order = await Order.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true }).populate(POPULATE_FIELDS);
    if (!order) return res.status(404).json({ error: "Order not found" });
    res.json(order);
  } catch (err) { res.status(400).json({ error: err.message }); }
});

// 💣 Hapus Order (DELETE /api/orders/:id)
router.delete("/:id", async (req, res) => {
  try {
    const order = await Order.findByIdAndDelete(req.params.id);
    if (!order) return res.status(404).json({ error: "Order not found" });
    res.status(204).send();
  } catch (err) { res.status(400).json({ error: err.message }); }
});

// 🔐 Update Token Order (PATCH /api/orders/:id/token)
router.patch("/:id/token", async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ error: "Token is required" });
    }

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { Token: token },
      { new: true }
    ).populate(POPULATE_FIELDS);

    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    res.json(order);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// 💳 Update Status Pembayaran (PATCH /api/orders/:id/payment-status)
router.patch("/:id/status-pembayaran", async (req, res) => {
  try {
    const { StatusPembayaran } = req.body;

    // validasi harus angka 0 / 1 / 2
    const allowedStatus = [0, 1, 2];
    if (!allowedStatus.includes(StatusPembayaran)) {
      return res.status(400).json({
        error: "StatusPembayaran harus bernilai 0, 1, atau 2",
      });
    }

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { StatusPembayaran },
      { new: true }
    ).populate(POPULATE_FIELDS);

    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    res.json(order);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

export default router;
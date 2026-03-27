import express from "express";
import Order from "../models/Order.js";
import Rating from "../models/Rating.js"
import User from "../models/User.js";

const router = express.Router();

router.get("/check/:orderId", async (req, res) => {
  try {
    const rating = await Rating.findOne({ OrderId: req.params.orderId });
    res.json({ exists: !!rating });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/add", async (req, res) => {
  try {
    const { OrderId, Rating: score, Ulasan } = req.body;

    if (!OrderId || !score) {
      return res.status(400).json({ error: "Data Order ID dan Rating wajib diisi." });
    }

    const newRating = new Rating({
      OrderId,
      Rating: score,
      Ulasan
    });

    await newRating.save();

    res.status(201).json({ message: "Ulasan Anda sangat berarti bagi kami!" });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ error: "Anda sudah memberikan ulasan untuk pesanan ini." });
    }
    res.status(500).json({ error: err.message });
  }
});

router.get("/florist/:id", async (req, res) => {
  try {
    const orders = await Order.find({ ShopId: req.params.id }).select("_id");
    const orderIds = orders.map(o => o._id);

    const ratings = await Rating.find({ OrderId: { $in: orderIds } })
      .populate({
        path: "OrderId",
        select: "UserId",
        populate: [
        { path: "UserId", model: User, select: "Name Email" }
        ]
      })
      .sort({ CreatedAt: -1 });

    res.json(ratings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/add", async (req, res) => {
  try {
    const { OrderId, Rating: score, Ulasan } = req.body;

    if (!OrderId || !score) {
      return res.status(400).json({ error: "Data Order ID dan Rating wajib diisi." });
    }

    const newRating = new Rating({
      OrderId,
      Rating: score,
      Ulasan
    });

    await newRating.save();

    res.status(201).json({ message: "Ulasan Anda sangat berarti bagi kami!" });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ error: "Anda sudah memberikan ulasan untuk pesanan ini." });
    }
    res.status(500).json({ error: err.message });
  }
});

export default router;
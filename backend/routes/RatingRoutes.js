import express from "express";
import Order from "../models/Order.js";
import Rating from "../models/Rating.js"
import User from "../models/User.js";

const router = express.Router();

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

export default router;
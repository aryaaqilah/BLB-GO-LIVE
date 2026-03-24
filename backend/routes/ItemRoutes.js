import express from "express";
import Item from "../models/Item.js";

const router = express.Router();

// ➕ Tambah Item Baru (POST /api/items)
router.post("/", async (req, res) => {
  try {
    const item = new Item(req.body);
    await item.save();
    res.status(201).json(item);
  } catch (err) { res.status(400).json({ error: err.message }); }
});

// 📚 Ambil Semua Item (GET /api/items)
router.get("/", async (req, res) => {
  try {
    const items = await Item.find().populate('ComponentId');
    res.json(items);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// GET item berdasarkan ShopId
router.get("/shop/:shopId", async (req, res) => {
  try {
    const { shopId } = req.params;

    const items = await Item.find({ ShopId: shopId })
      .populate("ComponentId")
      .populate("ShopId");

    res.json(items);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 📖 Ambil Item Berdasarkan ID (GET /api/items/:id)
router.get("/:id", async (req, res) => {
  try {
    const item = await Item.findById(req.params.id).populate('ComponentId');
    if (!item) return res.status(404).json({ error: "Item not found" });
    res.json(item);
  } catch (err) { res.status(400).json({ error: err.message }); }
});

// ✏️ Update Item (PUT /api/items/:id)
router.put("/:id", async (req, res) => {
  try {
    const item = await Item.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true }).populate('ComponentId');
    if (!item) return res.status(404).json({ error: "Item not found" });
    res.json(item);
  } catch (err) { res.status(400).json({ error: err.message }); }
});

// 🗑️ Hapus Item (DELETE /api/items/:id)
router.delete("/:id", async (req, res) => {
  try {
    const item = await Item.findByIdAndDelete(req.params.id);
    if (!item) return res.status(404).json({ error: "Item not found" });
    res.status(204).send();
  } catch (err) { res.status(400).json({ error: err.message }); }
});

router.get("/florist/:shopId", async (req, res) => {
  try {
    const items = await Item.find({ ShopId: req.params.shopId })
      .populate("ComponentId")
      .sort({ "ComponentId.Name": 1 });

    res.json(items);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
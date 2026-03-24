import express from "express";
import Shop from "../models/Shop.js";
import Address from "../models/Address.js"
import Province from "../models/Province.js"
import City from "../models/City.js"
import District from "../models/District.js"


const router = express.Router();
const POPULATE_FIELDS = ['Address'];

// ➕ Tambah Shop (POST /api/shops)
router.post("/", async (req, res) => {
  try {
    const shop = new Shop(req.body);
    await shop.save();
    res.status(201).json(shop);
  } catch (err) { res.status(400).json({ error: err.message }); }
});

// 📚 Ambil Semua Shop (GET /api/shops)
router.get("/", async (req, res) => {
  try {
    const shops = await Shop.find().populate(POPULATE_FIELDS);
    res.json(shops);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// 📖 Ambil Shop Berdasarkan ID (GET /api/shops/:id)
router.get("/:id", async (req, res) => {
  try {
    const shop = await Shop.findById(req.params.id).populate(POPULATE_FIELDS);
    if (!shop) return res.status(404).json({ error: "Shop not found" });
    res.json(shop);
  } catch (err) { res.status(400).json({ error: err.message }); }
});

// ✏️ Update Shop (PUT /api/shops/:id)
router.put("/:id", async (req, res) => {
  try {
    const shop = await Shop.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true }).populate(POPULATE_FIELDS);
    if (!shop) return res.status(404).json({ error: "Shop not found" });
    res.json(shop);
  } catch (err) { res.status(400).json({ error: err.message }); }
});

// 🗑️ Hapus Shop (DELETE /api/shops/:id)
router.delete("/:id", async (req, res) => {
  try {
    const shop = await Shop.findByIdAndDelete(req.params.id);
    if (!shop) return res.status(404).json({ error: "Shop not found" });
    res.status(204).send();
  } catch (err) { res.status(400).json({ error: err.message }); }
});

export default router;
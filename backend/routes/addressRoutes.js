import express from "express";
import Address from "../models/Address.js";

const router = express.Router();
const POPULATE_FIELDS = ['ProvinceId', 'CityId', 'DistrictId'];

// ➕ Tambah Address Baru (POST /api/addresses)
router.post("/", async (req, res) => {
  try {
    const address = new Address(req.body);
    await address.save();
    res.status(201).json(address);
  } catch (err) { res.status(400).json({ error: err.message }); }
});

// 📚 Ambil Semua Address (GET /api/addresses)
router.get("/", async (req, res) => {
  try {
    const addresses = await Address.find().populate(POPULATE_FIELDS);
    res.json(addresses);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// 📖 Ambil Address Berdasarkan ID (GET /api/addresses/:id)
router.get("/:id", async (req, res) => {
  try {
    const address = await Address.findById(req.params.id).populate(POPULATE_FIELDS);
    if (!address) return res.status(404).json({ error: "Address not found" });
    res.json(address);
  } catch (err) { res.status(400).json({ error: err.message }); }
});

// ✏️ Update Address (PUT /api/addresses/:id)
router.put("/:id", async (req, res) => {
  try {
    const address = await Address.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true }).populate(POPULATE_FIELDS);
    if (!address) return res.status(404).json({ error: "Address not found" });
    res.json(address);
  } catch (err) { res.status(400).json({ error: err.message }); }
});

// 🗑️ Hapus Address (DELETE /api/addresses/:id)
router.delete("/:id", async (req, res) => {
  try {
    const address = await Address.findByIdAndDelete(req.params.id);
    if (!address) return res.status(404).json({ error: "Address not found" });
    res.status(204).send();
  } catch (err) { res.status(400).json({ error: err.message }); }
});

export default router;
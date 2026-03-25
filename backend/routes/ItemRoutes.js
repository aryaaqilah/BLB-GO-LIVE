import express from "express";
import Item from "../models/Item.js";

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const item = new Item(req.body);
    await item.save();
    res.status(201).json(item);
  } catch (err) { res.status(400).json({ error: err.message }); }
});

router.get("/", async (req, res) => {
  try {
    const items = await Item.find().populate('ComponentId');
    res.json(items);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

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

router.delete("/bulk-delete", async (req, res) => {
  try {
    const { ids } = req.body;
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ error: "Daftar ID tidak valid." });
    }
    const result = await Item.deleteMany({ _id: { $in: ids } });
    res.json({ message: "Item berhasil dihapus", deletedCount: result.deletedCount });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const item = await Item.findById(req.params.id).populate('ComponentId');
    if (!item) return res.status(404).json({ error: "Item not found" });
    res.json(item);
  } catch (err) { res.status(400).json({ error: err.message }); }
});

router.put("/:id", async (req, res) => {
  try {
    const item = await Item.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true }).populate('ComponentId');
    if (!item) return res.status(404).json({ error: "Item not found" });
    res.json(item);
  } catch (err) { res.status(400).json({ error: err.message }); }
});

router.delete("/:id", async (req, res) => {
  try {
    const item = await Item.findByIdAndDelete(req.params.id);
    if (!item) return res.status(404).json({ error: "Item not found" });
    res.status(204).send();
  } catch (err) { res.status(400).json({ error: err.message }); }
});

export default router;
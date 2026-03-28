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

router.put("/:id/customization", async (req, res) => {
  try {
    const { accept, wrappers, ribbons } = req.body;
    const shopId = req.params.id;

    await Shop.findByIdAndUpdate(shopId, { AcceptCustomization: accept });

    await Item.deleteMany({ ShopId: shopId, Type: { $in: ['Wrapper', 'Ribbon'] } });

    if (!accept) return res.json({ message: "Kustomisasi dinonaktifkan." });

    const newItems = [];

    wrappers.forEach(w => {
      newItems.push({
        Name: `Wrapper ${w.label}`,
        Price: Number(w.price) || 0,
        Stok: Number(w.stok) || 0,
        ShopId: shopId,
        Type: 'Wrapper',
        HexCode: w.hex,
        ComponentId: w.componentId
      });
    });

    ribbons.forEach(r => {
      newItems.push({
        Name: `Pita ${r.label}`,
        Price: Number(r.price) || 0,
        Stok: Number(r.stok) || 0,
        ShopId: shopId,
        Type: 'Ribbon',
        HexCode: r.hex,
        ComponentId: r.componentId
      });
    });

    if (newItems.length > 0) await Item.insertMany(newItems);

    res.json({ 
      message: "Kustomisasi berhasil disimpan!", 
      itemsCreated: newItems.map(i => i.Name) 
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
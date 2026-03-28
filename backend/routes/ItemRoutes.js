import express from "express";
import Item from "../models/Item.js";
import Shop from "../models/Shop.js"
import mongoose from 'mongoose';

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

    const items = await Item.aggregate([
      {
        $match: { 
          ShopId: new mongoose.Types.ObjectId(shopId),
          ComponentId : {$ne : null}
          // Price: { $ne: 0 }
        }
      },
      {
        $group: {
          _id: "$ComponentId", // grouping berdasarkan ComponentId
          item: { $first: "$$ROOT" } // ambil 1 item saja
        }
      },
      {
        $replaceRoot: { newRoot: "$item" } // balik ke format normal
      }
    ]);

    // populate manual setelah aggregate
    const populatedItems = await Item.populate(items, [
      { path: "ComponentId" },
      { path: "ShopId" }
    ]);

    res.json(populatedItems);

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

// routes/items.js
router.post("/update-stock", async (req, res) => {
  try {
    const { items, type } = req.body;
    // type: "decrease" | "increase"

    for (const item of items) {
      const updateValue = type === "decrease" ? -item.Quantity : item.Quantity;

      const updated = await Item.findOneAndUpdate(
        {
          _id: item.ItemStokId,
          ...(type === "decrease" && { Stok: { $gte: item.Quantity } }) // ❗ validasi atomic
        },
        {
          $inc: { Stok: updateValue },
        },
        { new: true }
      );

      // ❗ kalau gagal saat decrease → stok tidak cukup
      if (!updated && type === "decrease") {
        return res.status(400).json({
          message: `Stok tidak cukup untuk item ${item.ItemStokId}`,
        });
      }
    }

    res.json({ message: `Stok berhasil ${type === "decrease" ? "dikurangi" : "dikembalikan"}` });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 🔄 Sinkronisasi Kustomisasi (PUT /api/items/customization/:shopId)
router.put("/customization/:shopId", async (req, res) => {
  try {
    const { accept, wrappers, ribbons } = req.body;
    const { shopId } = req.params;

    // 1. Update status kustomisasi di tabel Toko
    await Shop.findByIdAndUpdate(shopId, { AcceptCustomization: accept });

    // 2. Hapus item tipe Wrapper & Ribbon lama milik toko ini
    await Item.deleteMany({ ShopId: shopId, Type: { $in: ['Wrapper', 'Ribbon'] } });

    if (accept) {
      const newItems = [];
      
      // Map Wrapper
      wrappers.forEach(w => {
        newItems.push({
          Name: `Wrapper ${w.label}`,
          Price: Number(w.price),
          Stok: Number(w.stok),
          ShopId: shopId,
          Type: 'Wrapper',
          HexCode: w.hex
        });
      });

      // Map Ribbon
      ribbons.forEach(r => {
        newItems.push({
          Name: `Pita ${r.label}`,
          Price: Number(r.price),
          Stok: Number(r.stok),
          ShopId: shopId,
          Type: 'Ribbon',
          HexCode: r.hex
        });
      });

      if (newItems.length > 0) {
        await Item.insertMany(newItems);
      }
    }

    res.json({ message: "Kustomisasi berhasil diperbarui" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
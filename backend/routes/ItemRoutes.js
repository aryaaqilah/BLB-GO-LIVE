import express from "express";
import Item from "../models/Item.js";
import Shop from "../models/Shop.js";
import Product from "../models/Product.js";
import ProductDetail from "../models/ProductDetail.js";
import mongoose from 'mongoose';

const router = express.Router();


const checkItemUsage = async (itemIds) => {
  
  const details = await ProductDetail.find({ ItemId: { $in: itemIds } }).distinct('_id');
  
  
  const activeProduct = await Product.findOne({ 
    ProductDetail: { $in: details },
    IsDeleted: false 
  });
  return activeProduct;
};



router.get("/", async (req, res) => {
  try {
    const items = await Item.find({ IsDeleted: false }).populate('ComponentId');
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
          IsDeleted: false,
          $or: [
            { 
              
              Type: "Non-Custom", 
              ComponentId: { $ne: null } 
            },
            { 
              
              Type: { $in: ["Wrapper", "Ribbon"] } 
            }
          ]
        }
      },
      {
        $group: {
          
          _id: { 
            $cond: [
              { $eq: ["$Type", "Non-Custom"] }, 
              "$ComponentId", 
              "$_id"
            ] 
          },
          item: { $first: "$$ROOT" }
        }
      },
      { $replaceRoot: { newRoot: "$item" } }
    ]);

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
    const items = await Item.find({ ShopId: req.params.shopId, IsDeleted: false })
      .populate("ComponentId")
      .sort({ "ComponentId.Name": 1 });
    res.json(items);
  } catch (err) { res.status(500).json({ error: err.message }); }
});


router.delete("/bulk-delete", async (req, res) => {
  try {
    const { ids } = req.body;
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ error: "Daftar ID tidak valid." });
    }

    const isUsed = await checkItemUsage(ids);
    if (isUsed) {
      return res.status(400).json({ error: `Gagal. Salah satu item masih digunakan dalam produk '${isUsed.Name}' yang aktif.` });
    }

    
    await Item.updateMany({ _id: { $in: ids } }, { $set: { IsDeleted: true } });
    res.json({ message: "Item berhasil dihapus" });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post("/update-stock", async (req, res) => {
  try {
    const { items, type } = req.body;
    for (const item of items) {
      const updateValue = type === "decrease" ? -item.Quantity : item.Quantity;
      const updated = await Item.findOneAndUpdate(
        { _id: item.ItemStokId, IsDeleted: false, ...(type === "decrease" && { Stok: { $gte: item.Quantity } }) },
        { $inc: { Stok: updateValue } },
        { new: true }
      );
      if (!updated && type === "decrease") return res.status(400).json({ message: `Stok tidak cukup` });
    }
    res.json({ message: "Stok berhasil diupdate" });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.put("/customization/:shopId", async (req, res) => {
  try {
    const { accept, wrappers, ribbons } = req.body;
    const { shopId } = req.params;
    await Shop.findByIdAndUpdate(shopId, { AcceptCustomization: accept });
    await Item.deleteMany({ ShopId: shopId, Type: { $in: ['Wrapper', 'Ribbon'] } }); 

    if (accept) {
      const newItems = wrappers.map(w => ({
        Name: `Wrapper ${w.label}`, Price: Number(w.price), Stok: Number(w.stok),
        ShopId: shopId, Type: 'Wrapper', HexCode: w.hex, IsDeleted: false
      })).concat(ribbons.map(r => ({
        Name: `Pita ${r.label}`, Price: Number(r.price), Stok: Number(r.stok),
        ShopId: shopId, Type: 'Ribbon', HexCode: r.hex, IsDeleted: false
      })));
      if (newItems.length > 0) await Item.insertMany(newItems);
    }
    res.json({ message: "Kustomisasi berhasil diperbarui" });
  } catch (err) { res.status(500).json({ error: err.message }); }
});



router.post("/", async (req, res) => {
  try {
    const item = new Item({ ...req.body, IsDeleted: false });
    await item.save();
    res.status(201).json(item);
  } catch (err) { res.status(400).json({ error: err.message }); }
});

router.get("/:id", async (req, res) => {
  try {
    const item = await Item.findOne({ _id: req.params.id, IsDeleted: false }).populate('ComponentId');
    if (!item) return res.status(404).json({ error: "Item tidak ditemukan" });
    res.json(item);
  } catch (err) { res.status(400).json({ error: err.message }); }
});

router.put("/:id", async (req, res) => {
  try {
    const item = await Item.findByIdAndUpdate(req.params.id, req.body, { new: true }).populate('ComponentId');
    if (!item) return res.status(404).json({ error: "Item tidak ditemukan" });
    res.json(item);
  } catch (err) { res.status(400).json({ error: err.message }); }
});

router.delete("/:id", async (req, res) => {
  try {
    const isUsed = await checkItemUsage([req.params.id]);
    if (isUsed) {
      return res.status(400).json({ error: `Gagal. Item masih digunakan dalam produk '${isUsed.Name}' yang aktif.` });
    }

    
    const item = await Item.findByIdAndUpdate(req.params.id, { $set: { IsDeleted: true } });
    if (!item) return res.status(404).json({ error: "Item tidak ditemukan" });
    res.json({ message: "Item berhasil dihapus" });
  } catch (err) { res.status(400).json({ error: err.message }); }
});

export default router;
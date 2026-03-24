import express from "express";
import Product from "../models/Product.js";
import ProductDetail from "../models/ProductDetail.js";
import Item from '../models/Item.js';
import Component from '../models/Component.js';

const router = express.Router();
const POPULATE_FIELDS = ['ThreeDModel', 'Items'];

// 🛍️ Tambah Product Baru (POST /api/products)
router.post("/", async (req, res) => {
  try {
    const product = new Product(req.body);
    console.log(product);
    await product.save();
    res.status(201).json(product);
  } catch (err) { res.status(400).json({ error: err.message }); }
});

router.get("/", async (req, res) => {
  try {
    const products = await Product.find()
      .populate({
        path: "ProductDetail",
        model: ProductDetail,
        populate: {
          path: "ItemId",
          model: Item,
          populate: {
            path: "ComponentId",
            model: Component
          }
        }
      })
      .sort({ CreatedAt: -1 });

    res.json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 🔎 Ambil Product Berdasarkan ID (GET /api/products/:id)
router.get("/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate(POPULATE_FIELDS);
    if (!product) return res.status(404).json({ error: "Product not found" });
    res.json(product);
  } catch (err) { res.status(400).json({ error: err.message }); }
});

// 🖊️ Update Product (PUT /api/products/:id)
router.put("/:id", async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true }).populate(POPULATE_FIELDS);
    if (!product) return res.status(404).json({ error: "Product not found" });
    res.json(product);
  } catch (err) { res.status(400).json({ error: err.message }); }
});

// ❌ Hapus Product (DELETE /api/products/:id)
router.delete("/:id", async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ error: "Product not found" });
    res.status(204).send();
  } catch (err) { res.status(400).json({ error: err.message }); }
});

router.get("/florist/:shopId", async (req, res) => {
  try {
    const products = await Product.find({ ShopId: req.params.shopId })
      .populate({
        path: "ThreeDModel",
        model: "3DModel"
      })
      .populate({
        path: "ProductDetail",
        model: "ProductDetail",
        populate: {
          path: "ItemId",
          model: "Item",
          populate: {
            path: "ComponentId",
            model: "Component"
          }
        }
      })
      .sort({ Name: 1 });

    res.json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
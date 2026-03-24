import express from "express";
import ProductDetail from "../models/ProductDetail.js";

const router = express.Router();


// CREATE ProductDetail
router.post("/", async (req, res) => {
  try {
    const { ItemId, Quantity } = req.body;

    const newProductDetail = new ProductDetail({
      ItemId,
      Quantity,
    });

    const saved = await newProductDetail.save();
    res.status(201).json(saved);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


// GET ALL ProductDetails
router.get("/", async (req, res) => {
  try {
    const data = await ProductDetail.find().populate("Item");
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


// GET BY ID
router.get("/:id", async (req, res) => {
  try {
    const data = await ProductDetail.findById(req.params.id).populate("Item");

    if (!data) {
      return res.status(404).json({ message: "ProductDetail not found" });
    }

    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


// UPDATE
router.put("/:id", async (req, res) => {
  try {
    const { Item, Quantity } = req.body;

    const updated = await ProductDetail.findByIdAndUpdate(
      req.params.id,
      { Item, Quantity },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ message: "ProductDetail not found" });
    }

    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


// DELETE
router.delete("/:id", async (req, res) => {
  try {
    const deleted = await ProductDetail.findByIdAndDelete(req.params.id);

    if (!deleted) {
      return res.status(404).json({ message: "ProductDetail not found" });
    }

    res.json({ message: "Deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
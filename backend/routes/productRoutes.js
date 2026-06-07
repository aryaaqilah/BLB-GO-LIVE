import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import Order from "../models/Order.js"
import Product from "../models/Product.js";
import ProductDetail from "../models/ProductDetail.js";

const router = express.Router();
const POPULATE_FIELDS = ['ThreeDModel', 'ProductDetail', 'ShopId'];

const storage = multer.diskStorage({
  destination: "uploads/",
  filename: (req, file, cb) => { cb(null, Date.now() + path.extname(file.originalname)); }
});
const upload = multer({ storage });

const processDetails = async (detailsJson) => {
  const details = JSON.parse(detailsJson);
  const detailIds = [];
  for (const item of details) {
    const newDetail = new ProductDetail({ ItemId: item.ItemId, Quantity: item.Quantity });
    const savedDetail = await newDetail.save();
    detailIds.push(savedDetail._id);
  }
  return detailIds;
};

router.get("/get-by-id/:id", async (req, res) => {
  try {
    const product = await Product.findOne({
      _id: req.params.id,
      IsDeleted: false
    })
      .populate(POPULATE_FIELDS)
      .populate({
        path: "ProductDetail",
        populate: { path: "ItemId" }
      });

    if (!product) {
      return res.status(404).json({ error: "Product tidak ditemukan" });
    }

    res.json(product);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/best-sellers", async (req, res) => {
  try {
    let results = await Order.aggregate([
      { $match: { Status: { $gte: 1 }, ProductDetail: { $ne: null } } }, 
      {
        $lookup: {
          from: "products", 
          localField: "ProductId",
          foreignField: "_id",
          as: "ProductInfo"
        }
      },
      { $unwind: "$ProductInfo" },
      { $match: { "ProductInfo.IsCustomized": 0, "ProductInfo.IsDeleted": false, "ProductInfo.ProductDetail": { $ne: null } } }, 
      {
        $group: {
          _id: "$ProductId",
          TotalSales: { $sum: 1 },
          Name: { $first: "$ProductInfo.Name" },
          Price: { $first: "$ProductInfo.Price" },
          Image: { $first: "$ProductInfo.Image" },
          Memo: { $first: "$ProductInfo.Memo" },
          Tipe: { $first: "$ProductInfo.Tipe" } 
        }
      },
      { $sort: { TotalSales: -1 } },
      { $limit: 5 }
    ]);

    if (results.length < 5) {
      const existingIds = results.map(item => item._id);
      const limitNeeded = 5 - results.length;
      const recentProducts = await Product.find({
        IsCustomized: 0,
        IsDeleted: false, 
        _id: { $nin: existingIds }
      }).sort({ CreatedAt: -1 }).limit(limitNeeded);

      const formattedRecent = recentProducts.map(p => ({
        _id: p._id, Name: p.Name, Price: p.Price, Image: p.Image, Memo: p.Memo, Tipe: p.Tipe, TotalSales: 0 
      }));
      results = [...results, ...formattedRecent];
    }
    res.json(results);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete("/bulk-delete", async (req, res) => {
  try {
    const { ids } = req.body;
    
    await Product.updateMany({ _id: { $in: ids } }, { $set: { IsDeleted: true } });
    res.json({ message: "Produk berhasil dihapus" });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post("/", upload.single("Image"), async (req, res) => {
  try {
    const detailIds = req.body.ProductDetail ? await processDetails(req.body.ProductDetail) : [];
    const newProduct = new Product({
      ...req.body,
      Price: Number(req.body.Price),
      IsCustomized: 0,
      ProductDetail: detailIds,
      IsDeleted: false, 
      Image: req.file ? `/uploads/${req.file.filename}` : ""
    });
    await newProduct.save();
    res.status(201).json(newProduct);
  } catch (err) { res.status(400).json({ error: err.message }); }
});

router.put("/:id", upload.single("Image"), async (req, res) => {
  try {
    const updateData = { ...req.body };
    if (req.body.ProductDetail) updateData.ProductDetail = await processDetails(req.body.ProductDetail);
    if (req.file) updateData.Image = `/uploads/${req.file.filename}`;

    const updatedProduct = await Product.findByIdAndUpdate(req.params.id, updateData, { new: true });
    res.json(updatedProduct);
  } catch (err) { res.status(400).json({ error: err.message }); }
});

router.get("/florist/:shopId", async (req, res) => {
  try {
    const products = await Product.find({ ShopId: req.params.shopId, IsDeleted: false })
      .populate({ path: "ProductDetail", populate: { path: "ItemId" } })
      .sort({ Name: 1 });
    res.json(products);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get("/get-shop", async (req, res) => {
  try {
    const products = await Product.find({IsCustomized: 0, IsDeleted: false}).populate(POPULATE_FIELDS);
    res.json(products);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get("/shop/:shopId", async (req, res) => {
  try {
    const products = await Product.find({ 
        ShopId: req.params.shopId, 
        IsCustomized: 0, 
        IsDeleted: false 
    }).populate(POPULATE_FIELDS).populate({
      path: "ProductDetail",
      populate: "ItemId"
    });
    res.json(products);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete("/:id", async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, { $set: { IsDeleted: true } });
    if (!product) return res.status(404).json({ error: "Product not found" });
    res.json({ message: "Produk berhasil dihapus" });
  } catch (err) { res.status(400).json({ error: err.message }); }
});

router.post("/payment/post", async (req, res) => {
  try {
    const {
      Name,
      Price,
      Image,
      ThreeDModel,
      Memo,
      ProductDetail,
      ShopId,
      IsCustomized,
      Tipe,
      IsDeleted
    } = req.body;

    const newProduct = new Product({
      Name,
      Price: Number(Price),
      Image,
      ThreeDModel,
      Memo,
      ProductDetail, // langsung array of ObjectId
      ShopId,
      IsCustomized,
      Tipe,
      IsDeleted
    });

    const savedProduct = await newProduct.save();

    // optional: populate biar langsung usable di FE
    const populatedProduct = await Product.findById(savedProduct._id)
      .populate(POPULATE_FIELDS)
      .populate({
        path: "ProductDetail",
        populate: { path: "ItemId" }
      });

    res.status(201).json(populatedProduct);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});


export default router;
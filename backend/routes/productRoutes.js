import express from "express";
import multer from "multer";
import path from "path";
import Order from "../models/Order.js"
import Product from "../models/Product.js";
import ProductDetail from "../models/ProductDetail.js";

const router = express.Router();
const POPULATE_FIELDS = ['ThreeDModel', 'ProductDetail', 'ShopId'];

const storage = multer.diskStorage({
  destination: "uploads/",
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

const processDetails = async (detailsJson) => {
  const details = JSON.parse(detailsJson);
  const detailIds = [];
  for (const item of details) {
    const newDetail = new ProductDetail({
      ItemId: item.ItemId,
      Quantity: item.Quantity
    });
    const savedDetail = await newDetail.save();
    detailIds.push(savedDetail._id);
  }
  return detailIds;
};

const deleteFile = (relativePath) => {
  if (relativePath) {
    const fullPath = path.join(process.cwd(), relativePath); // sesuaikan jika path di DB diawali '/'
    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
    }
  }
};

router.get("/best-sellers", async (req, res) => {
  try {
    let results = await Order.aggregate([
      { $match: { Status: { $gte: 1 } } }, 
      {
        $lookup: {
          from: "products", 
          localField: "ProductId",
          foreignField: "_id",
          as: "ProductInfo"
        }
      },
      { $unwind: "$ProductInfo" },
      { $match: { "ProductInfo.IsCustomized": 0 } },
      {
        $group: {
          _id: "$ProductId",
          TotalSales: { $sum: 1 },
          Name: { $first: "$ProductInfo.Name" },
          Price: { $first: "$ProductInfo.Price" },
          Image: { $first: "$ProductInfo.Image" },
          Memo: { $first: "$ProductInfo.Memo" }
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
        _id: { $nin: existingIds }
      })
      .sort({ CreatedAt: -1 })
      .limit(limitNeeded);

      const formattedRecent = recentProducts.map(p => ({
        _id: p._id,
        Name: p.Name,
        Price: p.Price,
        Image: p.Image,
        Memo: p.Memo,
        TotalSales: 0 
      }));

      results = [...results, ...formattedRecent];
    }

    res.json(results);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 🗑️ Bulk Delete
router.delete("/bulk-delete", async (req, res) => {
  try {
    const { ids } = req.body;
    const products = await Product.find({ _id: { $in: ids } });
    for (const p of products) {
      if (p.ProductDetail) await ProductDetail.deleteMany({ _id: { $in: p.ProductDetail } });
    }
    await Product.deleteMany({ _id: { $in: ids } });
    res.json({ message: "Produk berhasil dihapus" });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// 🛍️ POST: Tambah Produk
router.post("/", upload.single("Image"), async (req, res) => {
  try {
    const detailIds = req.body.ProductDetail ? await processDetails(req.body.ProductDetail) : [];
    
    const newProduct = new Product({
      Name: req.body.Name,
      Price: Number(req.body.Price),
      Memo: req.body.Memo,
      ShopId: req.body.ShopId,
      IsCustomized: 0,
      Tipe: req.body.Tipe,
      ProductDetail: detailIds,
      Image: req.file ? `/uploads/${req.file.filename}` : ""
    });

    await newProduct.save();
    res.status(201).json(newProduct);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.post("/payment", async (req, res) => {
  try {
    const product = new Product(req.body);
    console.log(product);
    await product.save();
    res.status(201).json(product);
  } catch (err) { res.status(400).json({ error: err.message })
  };
});

// ✏️ PUT: Update Produk
router.put("/:id", upload.single("Image"), async (req, res) => {
  try {
    const updateData = {
      Name: req.body.Name,
      Price: Number(req.body.Price),
      Memo: req.body.Memo,
      Tipe: req.body.Tipe,
    };

    if (req.body.ProductDetail) {
      updateData.ProductDetail = await processDetails(req.body.ProductDetail);
    }

    if (req.file) {
      updateData.Image = `/uploads/${req.file.filename}`;
    }

    const updatedProduct = await Product.findByIdAndUpdate(req.params.id, updateData, { new: true });
    res.json(updatedProduct);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.get("/florist/:shopId", async (req, res) => {
  try {
    const products = await Product.find({ ShopId: req.params.shopId })
      .populate({ path: "ProductDetail", populate: { path: "ItemId" } })
      .sort({ Name: 1 });
    res.json(products);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get("/get-shop", async (req, res) => {
  try {
    const products = await Product.find({IsCustomized: 0}).populate(POPULATE_FIELDS);

    res.json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate({
      path: "ProductDetail",
      populate: { path: "ItemId" }
    });
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

router.get("/shop/:shopId", async (req, res) => {
  try {
    const products = await Product.find({ ShopId: req.params.shopId, IsCustomized: 0 }).populate(POPULATE_FIELDS).populate({
      path: "ProductDetail",
      populate: "ItemId"
    });

    res.json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});



export default router;
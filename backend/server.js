import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

// === Import Routes ===
import userRoutes from "./routes/UserRoutes.js";
import shopRoutes from "./routes/ShopRoutes.js";
import productRoutes from "./routes/ProductRoutes.js";
import productDetailsRoutes from "./routes/ProductDetailRoutes.js";
import orderRoutes from "./routes/OrderRoutes.js";
import design3DRoutes from "./routes/3dModelRoutes.js";
import ratingRoutes from "./routes/RatingRoutes.js";
import paymentRoutes from "./routes/PaymentRoutes.js";

// Inventory & Components
import itemRoutes from "./routes/ItemRoutes.js";
import componentRoutes from "./routes/ComponentRoutes.js";

// Shipping & Promo
import addressRoutes from "./routes/AddressRoutes.js";
import deliveryRoutes from "./routes/DeliveryRoutes.js";
import discountRoutes from "./routes/DiscountRoutes.js";
import administrationFeeRoutes from "./routes/AdministrationFeeRoutes.js";

// Geographic Data
import provinceRoutes from "./routes/ProvinceRoutes.js";
import cityRoutes from "./routes/CityRoutes.js";
import districtRoutes from "./routes/DistrictRoutes.js";
import postalCodeRoutes from "./routes/PostalCodeRoutes.js";

// Configuration
dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

// Path Setup untuk ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// === Middlewares ===
app.use(cors({ origin: process.env.CLIENT_URL || "http://localhost:3000" }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// === Static Files ===
// Melayani file dari folder 'uploads' di root project
// URL: http://localhost:5000/uploads/nama-file.jpg
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Melayani file model 3D
// URL: http://localhost:5000/models/nama-file.glb
app.use("/models", express.static(path.join(__dirname, "public", "models")));

// Folder public umum
app.use(express.static(path.join(__dirname, "public")));


// === 4. API Routes ===
// Core API
app.use("/api/users", userRoutes);
app.use("/api/shops", shopRoutes);
app.use("/api/products", productRoutes);
app.use("/api/productdetails", productDetailsRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/design3d", design3DRoutes);
app.use("/api/ratings", ratingRoutes);
app.use("/api/payment", paymentRoutes);

// Inventory API
app.use("/api/items", itemRoutes);
app.use("/api/components", componentRoutes);

// Logistic & Promo API
app.use("/api/addresses", addressRoutes);
app.use("/api/deliveries", deliveryRoutes);
app.use("/api/discounts", discountRoutes);
app.use("/api/adminfees", administrationFeeRoutes);

// Geographic API
app.use("/api/provinces", provinceRoutes);
app.use("/api/cities", cityRoutes);
app.use("/api/districts", districtRoutes);
app.use("/api/postalcodes", postalCodeRoutes);

// === 5. Health Check & Database Connection ===
app.get("/", (req, res) => {
  res.send("✅ Backend florist-3d API is running!");
});

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.error("❌ MongoDB Connection Error:", err));

// === 6. Start Server ===
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📂 Static uploads ready at http://localhost:${PORT}/uploads`);
});
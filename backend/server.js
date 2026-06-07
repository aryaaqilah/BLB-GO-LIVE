import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";


import userRoutes from "./routes/UserRoutes.js";
import shopRoutes from "./routes/ShopRoutes.js";
import productRoutes from "./routes/ProductRoutes.js";
import productDetailsRoutes from "./routes/ProductDetailRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import design3DRoutes from "./routes/3dModelRoutes.js";
import ratingRoutes from "./routes/RatingRoutes.js";
import paymentRoutes from "./routes/PaymentRoutes.js";


import itemRoutes from "./routes/ItemRoutes.js";
import componentRoutes from "./routes/ComponentRoutes.js";


import addressRoutes from "./routes/AddressRoutes.js";
import deliveryRoutes from "./routes/DeliveryRoutes.js";
import discountRoutes from "./routes/DiscountRoutes.js";
import administrationFeeRoutes from "./routes/AdministrationFeeRoutes.js";


import provinceRoutes from "./routes/ProvinceRoutes.js";
import cityRoutes from "./routes/CityRoutes.js";
import districtRoutes from "./routes/DistrictRoutes.js";
import postalCodeRoutes from "./routes/PostalCodeRoutes.js";
import changeLogRoutes from "./routes/ChangeLogRoutes.js";


dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


// === Middleware ===
// app.use(cors({ origin: process.env.CLIENT_URL || "http://localhost:3000" })); // Izinkan frontend React (menggunakan env atau fallback)
const allowedOrigins = [
  process.env.CLIENT_URL,
  "https://blb-prod.vercel.app",
  "https://blb-go-live.vercel.app"
].filter(Boolean); // Menghapus nilai null/undefined agar tidak error

app.use(cors({
  origin: function (origin, callback) {
    // Izinkan jika origin ada di daftar atau jika request tidak punya origin (seperti Postman/Server-to-server)
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

console.log("MONGO_URI:", process.env.MONGO_URI ? "✅ Loaded" : "❌ Missing");
console.log("CLIENT_URL:", process.env.CLIENT_URL);




app.use("/uploads", express.static(path.join(__dirname, "uploads")));



app.use("/models", express.static(path.join(__dirname, "public", "models")));


app.use(express.static(path.join(__dirname, "public")));




app.use("/api/users", userRoutes);
app.use("/api/shops", shopRoutes);
app.use("/api/products", productRoutes);
app.use("/api/productdetails", productDetailsRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/design3d", design3DRoutes);
app.use("/api/ratings", ratingRoutes);
app.use("/api/payment", paymentRoutes);


app.use("/api/items", itemRoutes);
app.use("/api/components", componentRoutes);


app.use("/api/addresses", addressRoutes);
app.use("/api/deliveries", deliveryRoutes);
app.use("/api/discounts", discountRoutes);
app.use("/api/adminfees", administrationFeeRoutes);


app.use("/api/provinces", provinceRoutes);
app.use("/api/cities", cityRoutes);
app.use("/api/districts", districtRoutes);
app.use("/api/postalcodes", postalCodeRoutes);
app.use("/api/changelogs", changeLogRoutes);

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
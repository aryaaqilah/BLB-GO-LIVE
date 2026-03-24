import mongoose from "mongoose";

const itemSchema = new mongoose.Schema({
  ComponentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Component', required: true }, // Foreig
  Price: { type: Number, required: true },
  Stok: { type: Number, required: true },
  ShopId: { type: mongoose.Schema.Types.ObjectId, ref: 'Shop', required: true }
});

export default mongoose.model("Item", itemSchema);
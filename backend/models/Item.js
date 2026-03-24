import mongoose from "mongoose";

const itemSchema = new mongoose.Schema({
  ComponentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Component', required: true }, // Foreign Key
  Quantity: { type: Number, required: true },
  Shop: { type: mongoose.Schema.Types.ObjectId, ref: 'Shop', required: true },
});

export default mongoose.model("Item", itemSchema);
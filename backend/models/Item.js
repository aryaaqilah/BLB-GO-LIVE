import mongoose from "mongoose";

const itemSchema = new mongoose.Schema({
  Name: { type: String, required: true },
  ComponentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Component', required: false }, 
  Price: { type: Number, required: true },
  Stok: { type: Number, required: true },
  ShopId: { type: mongoose.Schema.Types.ObjectId, ref: 'Shop', required: true },
  Type: { type: String, enum: ['Non-Custom', 'Wrapper', 'Ribbon'], default: 'Non-Custom' },
  HexCode: { type: String, required: false },
  IsDeleted: { type: Boolean, default: false },
});

export default mongoose.model("Item", itemSchema);
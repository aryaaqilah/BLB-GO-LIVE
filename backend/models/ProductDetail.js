import mongoose from "mongoose";

const productDetailSchema = new mongoose.Schema({
  ItemId: { type: mongoose.Schema.Types.ObjectId, ref: 'Item', required: true },
  Quantity: { type: Number, required: true },
});

export default mongoose.model("ProductDetail", productDetailSchema);
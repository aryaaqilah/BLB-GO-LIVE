import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
  Name: { type: String, required: true },
  Price: { type: Number, required: true },
  Quantity: { type: Number, required: true },
  Image: { type: String, required: true },
  ThreeDModel : { type: mongoose.Schema.Types.ObjectId, ref: '3DModel', required: false },
  Memo: { type: String, required: false },
  ProductDetail: [{ type: mongoose.Schema.Types.ObjectId, ref: 'ProductDetail', required: false }],
  ShopId: { type: mongoose.Schema.Types.ObjectId, ref: 'Shop', required: true },
  IsCustomized : { type: Number, required: true },
});

export default mongoose.model("Product", productSchema);
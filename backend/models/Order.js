import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
  Status: { type: String, required: true },
  AddressId: { type: mongoose.Schema.Types.ObjectId, ref: 'Address', required: true },
  DeliveryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Delivery', required: true },
  ProductId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  Notes: { type: String, required: false },
  ProductPrice: { type: Number, required: true },
  AdministrationFee: { type: mongoose.Schema.Types.ObjectId, ref: 'AdministrationFee', required: true },
  // DiscountId: { type: mongoose.Schema.Types.ObjectId, ref: 'Discount', required: false },
  Total: { type: Number, required: true },
  ShopId: { type: mongoose.Schema.Types.ObjectId, ref: 'Shop', required: true },
  Token: { type: String, required: false },
  StatusPembayaran : {type: Number, required: true}
});

export default mongoose.model("Order", orderSchema);
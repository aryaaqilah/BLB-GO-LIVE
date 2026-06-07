import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
  UserId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

  ShopId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Shop",
    required: true,
  },

  Status: {
    type: Number,
    required: true,
    min: 0,
  },

  AddressId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Address",
    required: true,
  },

  DeliveryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Delivery",
    required: true,
  },

  ProductId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },

  Notes: {
    type: String,
    required: false,
    maxlength: 500,
    trim: true,
  },

  ProductPrice: {
    type: Number,
    required: true,
    min: 0,
  },

  AdministrationFee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "AdministrationFee",
    required: true,
  },

  Total: {
    type: Number,
    required: true,
    min: 0,
  },

  Token: {
    type: String,
    required: false,
    maxlength: 255,
    trim: true,
  },

  StatusPembayaran: {
    type: Number,
    required: true,
    min: 0,
  },

  CreatedAt: {
    type: Date,
    default: Date.now,
  },

  IsDeleted: {
    type: Boolean,
    default: false,
  },
});

export default mongoose.model("Order", orderSchema);
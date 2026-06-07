import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
  Name: {
    type: String,
    required: true,
    maxlength: 100,
    trim: true,
  },

  Price: {
    type: Number,
    required: true,
    min: 0,
  },

  Image: {
    type: String,
    required: true,
    maxlength: 255,
  },

  ThreeDModel: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "3DModel",
    required: false,
  },

  Memo: {
    type: String,
    required: false,
    maxlength: 500,
    trim: true,
  },

  ProductDetail: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ProductDetail",
      required: false,
    },
  ],

  ShopId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Shop",
    required: true,
  },

  IsCustomized: {
    type: Number,
    required: true,
    enum: [0, 1],
  },

  Tipe: {
    type: String,
    enum: ["Segar", "Buatan", "Kering"],
    default: "Segar",
    required: true,
    maxlength: 20,
  },

  IsDeleted: {
    type: Boolean,
    default: false,
  },
});

export default mongoose.model("Product", productSchema);
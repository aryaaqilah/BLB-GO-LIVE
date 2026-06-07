import mongoose from "mongoose";

const itemSchema = new mongoose.Schema({
  Name: {
    type: String,
    required: true,
    maxlength: 100,
    trim: true,
  },

  ComponentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Component",
    required: false,
  },

  Price: {
    type: Number,
    required: true,
    min: 0,
  },

  Stok: {
    type: Number,
    required: true,
    min: 0,
  },

  ShopId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Shop",
    required: true,
  },

  Type: {
    type: String,
    enum: ["Non-Custom", "Wrapper", "Ribbon"],
    default: "Non-Custom",
    maxlength: 20,
  },

  HexCode: {
    type: String,
    required: false,
    maxlength: 10,
    trim: true,
  },

  IsDeleted: {
    type: Boolean,
    default: false,
  },
});

export default mongoose.model("Item", itemSchema);
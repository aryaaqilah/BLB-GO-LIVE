import mongoose from "mongoose";

const componentSchema = new mongoose.Schema({
  Name: {
    type: String,
    required: true,
    maxlength: 100,
    trim: true,
  },

  Asset: {
    type: String,
    required: true,
    maxlength: 255,
    trim: true,
  },

  Image: {
    type: String,
    required: true,
    maxlength: 255,
    trim: true,
  },
});

export default mongoose.model("Component", componentSchema);
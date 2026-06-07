import mongoose from "mongoose";

const threeDModelSchema = new mongoose.Schema({
  Path: {
    type: String,
    required: true,
    maxlength: 255,
    trim: true,
  },

  Question: {
    type: String,
    required: false,
    maxlength: 255,
    trim: true,
  },

  Answer: {
    type: String,
    required: false,
    maxlength: 255,
    trim: true,
  },
});

export default mongoose.model("3DModel", threeDModelSchema);
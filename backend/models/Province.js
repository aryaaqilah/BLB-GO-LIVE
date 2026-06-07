import mongoose from "mongoose";

const provinceSchema = new mongoose.Schema({
  provinsi_name: {
    type: String,
    required: true,
    maxlength: 100,
    trim: true,
  },
});

export default mongoose.model("Province", provinceSchema);
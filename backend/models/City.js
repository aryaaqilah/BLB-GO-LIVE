import mongoose from "mongoose";

const citySchema = new mongoose.Schema({
  provinsi_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Province",
    required: true,
  },

  city_name: {
    type: String,
    required: true,
    maxlength: 100,
    trim: true,
  },
});

export default mongoose.model("City", citySchema);
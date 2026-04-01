import mongoose from "mongoose";

const districtSchema = new mongoose.Schema({
  city_id: { type: mongoose.Schema.Types.ObjectId, ref: 'City', required: true }, 
  district_name: { type: String, required: true },
});

export default mongoose.model("District", districtSchema);
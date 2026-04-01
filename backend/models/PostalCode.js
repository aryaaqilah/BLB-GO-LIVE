import mongoose from "mongoose";

const postalCodeSchema = new mongoose.Schema({
  Name: { type: String, required: true },
  DistrictId: { type: mongoose.Schema.Types.ObjectId, ref: 'District', required: false }, 
});

export default mongoose.model("PostalCode", postalCodeSchema);
import mongoose from "mongoose";

const addressSchema = new mongoose.Schema({
  RecipientNumber: { type: String, required: true },
  RecipientName: { type: String, required: true },
  ProvinceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Province', required: true },
  CityId: { type: mongoose.Schema.Types.ObjectId, ref: 'City', required: true },
  DistrictId: { type: mongoose.Schema.Types.ObjectId, ref: 'District', required: true },
  PostalCodeId: { type: mongoose.Schema.Types.ObjectId, ref: 'PostalCode', required: true },
  Detail: { type: String, required: true }
});

export default mongoose.model("Address", addressSchema);
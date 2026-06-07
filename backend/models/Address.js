import mongoose from "mongoose";

const addressSchema = new mongoose.Schema({
  RecipientNumber: {
    type: String,
    required: true,
    maxlength: 15,
    trim: true,
  },

  RecipientName: {
    type: String,
    required: true,
    maxlength: 100,
    trim: true,
  },

  ProvinceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Province",
    required: true,
  },

  CityId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "City",
    required: true,
  },

  DistrictId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "District",
    required: true,
  },

  PostalCodeId: {
    type: String,
    required: true,
    maxlength: 10,
    trim: true,
  },

  Detail: {
    type: String,
    required: true,
    maxlength: 255,
    trim: true,
  },
});

export default mongoose.model("Address", addressSchema);
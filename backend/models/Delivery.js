import mongoose from "mongoose";

const deliverySchema = new mongoose.Schema({
  ShippingCode: {
    type: String,
    required: true,
    maxlength: 100,
    trim: true,
  },

  Service: {
    type: String,
    required: true,
    maxlength: 100,
    trim: true,
  },

  EstimatedArrival: {
    type: Date,
    required: true,
  },

  TrackingLink: {
    type: String,
    required: true,
    maxlength: 255,
    trim: true,
  },

  Notes: {
    type: String,
    required: false,
    maxlength: 500,
    trim: true,
  },

  Price: {
    type: Number,
    required: true,
    min: 0,
  },
});

export default mongoose.model("Delivery", deliverySchema);
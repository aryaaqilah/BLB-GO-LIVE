import mongoose from "mongoose";

const deliverySchema = new mongoose.Schema({
  ShippingCode: { type: String, required: true},
  Service: { type: String, required: true },
  EstimatedArrival: { type: Date, required: true },
  TrackingLink: { type: String, required: true },
  Notes: { type: String, required: false },
  Price: { type: Number, required: true },
});

export default mongoose.model("Delivery", deliverySchema);
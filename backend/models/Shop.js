import mongoose from "mongoose";

const shopSchema = new mongoose.Schema({
  Name: { type: String, required: true },
  Email: { type: String, required: true, unique: true },
  Password: { type: String, required: true },
  PhoneNumber: { type: String, required: true },
  Address: { type: mongoose.Schema.Types.ObjectId, ref: 'Address', required: true },
  Logo: { type: String, required: false },
  AcceptCustomization: { type: Boolean, required: false },
});

export default mongoose.model("Shop", shopSchema);
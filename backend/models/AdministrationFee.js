import mongoose from "mongoose";

const administrationFeeSchema = new mongoose.Schema({
  Fee: {
    type: Number,
    required: true,
    unique: true,
    min: 0,
  },
});

export default mongoose.model("AdministrationFee", administrationFeeSchema);
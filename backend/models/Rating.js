import mongoose from "mongoose";

const RatingSchema = new mongoose.Schema({
  OrderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: true,
    unique: true 
  },
  Rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  Ulasan: {
    type: String,
    trim: true,
    maxLength: 500
  },
  CreatedAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model("Rating", RatingSchema);
import mongoose from "mongoose";

const changeLogSchema = new mongoose.Schema({
  AdminId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Admin",
    required: true,
  },

  TargetId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },

  TargetType: {
    type: String,
    enum: ["User", "Shop", "Order"],
    required: true,
    maxlength: 20,
  },

  TargetName: {
    type: String,
    required: true,
    maxlength: 100,
    trim: true,
  },

  Action: {
    type: String,
    enum: ["Create", "Update", "Delete"],
    required: true,
    maxlength: 20,
  },

  CreatedAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model("ChangeLog", changeLogSchema);
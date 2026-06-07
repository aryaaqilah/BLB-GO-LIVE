import mongoose from "mongoose";
import bcrypt from "bcrypt";

const shopSchema = new mongoose.Schema({
  Name: {
    type: String,
    required: true,
    maxlength: 100,
    trim: true,
  },

  Email: {
    type: String,
    required: true,
    unique: true,
    maxlength: 255,
    trim: true,
    lowercase: true,
  },

  Password: {
    type: String,
    required: true,
    maxlength: 255,
  },

  PhoneNumber: {
    type: String,
    required: true,
    maxlength: 15,
    trim: true,
  },

  Address: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Address",
    required: true,
  },

  Logo: {
    type: String,
    maxlength: 255,
  },

  AcceptCustomization: {
    type: Boolean,
    default: false,
  },

  IsDeleted: {
    type: Boolean,
    default: false,
  },
});

// Hash password sebelum save
shopSchema.pre("save", async function (next) {
  try {
    if (!this.isModified("Password")) {
      return next();
    }

    this.Password = await bcrypt.hash(this.Password, 10);
    next();
  } catch (error) {
    next(error);
  }
});

// Method untuk verifikasi password
shopSchema.methods.comparePassword = async function (
  candidatePassword
) {
  return bcrypt.compare(
    candidatePassword,
    this.Password
  );
};

export default mongoose.model("Shop", shopSchema);
import mongoose from "mongoose";
import bcrypt from "bcrypt";

const adminSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    maxlength: 100,
    trim: true,
  },

  password: {
    type: String,
    required: true,
    maxlength: 255,
  },

  userType: {
    type: String,
    default: "admin",
    maxlength: 20,
    trim: true,
  },
});

// Hash password sebelum save
adminSchema.pre("save", async function (next) {
  try {
    if (!this.isModified("password")) {
      return next();
    }

    this.password = await bcrypt.hash(this.password, 10);

    next();
  } catch (error) {
    next(error);
  }
});

// Method untuk verifikasi password
adminSchema.methods.comparePassword = async function (
  candidatePassword
) {
  return bcrypt.compare(
    candidatePassword,
    this.password
  );
};

export default mongoose.model("Admin", adminSchema);
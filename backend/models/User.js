import mongoose from "mongoose";
import bcrypt from "bcrypt";

const userSchema = new mongoose.Schema({
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

  IsDeleted: {
    type: Boolean,
    default: false,
  },
});

// Hash password sebelum disimpan
userSchema.pre("save", async function (next) {
  try {
    // Jangan hash ulang jika password tidak berubah
    if (!this.isModified("Password")) {
      return next();
    }

    const saltRounds = 10;
    this.Password = await bcrypt.hash(this.Password, saltRounds);

    next();
  } catch (error) {
    next(error);
  }
});

userSchema.methods.comparePassword = async function (
  candidatePassword
) {
  return bcrypt.compare(
    candidatePassword,
    this.Password
  );
};

export default mongoose.model("User", userSchema);
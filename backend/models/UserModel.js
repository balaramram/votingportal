import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  faceData: { type: String, required: true }, // Store face descriptor as string
  dob: { type: Date, required: true },
  // fingerprintData: { type: String, required: true }, // Store fingerprint hash or data
  // department: { type: String, required: true },
  // year: { type: Number, required: true },
  // batch: { type: String, required: true },
  isVerified: { type: Boolean, default: false },
  verificationToken: { type: String },
  verificationExpires: { type: Date },
  resetToken: { type: String },
  resetExpires: { type: Date },
  createdAt: { type: Date, default: Date.now },
});

UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

const User = mongoose.model("User", UserSchema);

export default User;

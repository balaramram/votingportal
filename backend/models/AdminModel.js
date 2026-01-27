import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const AdminSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  department: [{ type: String, required: true }],
  createdAt: { type: Date, default: Date.now },
});

AdminSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

const AdminModel = mongoose.model("Admin", AdminSchema);

export { AdminModel };

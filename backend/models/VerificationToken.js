import mongoose from "mongoose";

const VerificationTokenSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  code: { type: String, required: true },
  verified: { type: Boolean, default: false },
  expiresAt: { type: Date, required: true },
});

const VerificationToken = mongoose.model(
  "VerificationToken",
  VerificationTokenSchema
);

export default VerificationToken;

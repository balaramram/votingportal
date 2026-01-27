import mongoose from "mongoose";

const VotingSchema = new mongoose.Schema({
  title: { type: String, required: true },
  options: [{ type: String, required: true }],
  department: { type: String, required: true },
  votes: [
    {
      userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      option: String,
    },
  ],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Admin",
    required: true,
  },
  createdAt: { type: Date, default: Date.now },
  endDate: { type: Date },
  isActive: { type: Boolean, default: true },
});

const VotingModel = mongoose.model("Voting", VotingSchema);

export { VotingModel };

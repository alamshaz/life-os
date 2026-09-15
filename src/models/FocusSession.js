import mongoose from "mongoose";

const FocusSessionSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    label: { type: String, default: "Focus session" },
    durationMinutes: { type: Number, required: true },
    startedAt: { type: Date, required: true },
    completedAt: { type: Date, required: true }
  },
  { timestamps: true }
);

FocusSessionSchema.index({ user: 1, startedAt: -1 });

export default mongoose.models.FocusSession || mongoose.model("FocusSession", FocusSessionSchema);

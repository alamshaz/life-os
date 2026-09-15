import mongoose from "mongoose";

const HabitSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    name: { type: String, required: true, trim: true },
    color: { type: String, default: "#2F5D62" },
    targetDaysPerWeek: { type: Number, default: 7 },
    archived: { type: Boolean, default: false }
  },
  { timestamps: true }
);

export default mongoose.models.Habit || mongoose.model("Habit", HabitSchema);

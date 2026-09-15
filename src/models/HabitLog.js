import mongoose from "mongoose";

const HabitLogSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    habit: { type: mongoose.Schema.Types.ObjectId, ref: "Habit", required: true, index: true },
    // Stored as YYYY-MM-DD (local to the user) so toggling is a simple upsert/delete, not a range query.
    date: { type: String, required: true }
  },
  { timestamps: true }
);

HabitLogSchema.index({ habit: 1, date: 1 }, { unique: true });

export default mongoose.models.HabitLog || mongoose.model("HabitLog", HabitLogSchema);

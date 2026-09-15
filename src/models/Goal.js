import mongoose from "mongoose";

const GoalSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    targetValue: { type: Number, default: 100 },
    currentValue: { type: Number, default: 0 },
    unit: { type: String, default: "%" },
    dueDate: { type: Date },
    status: { type: String, enum: ["active", "done", "abandoned"], default: "active" }
  },
  { timestamps: true }
);

export default mongoose.models.Goal || mongoose.model("Goal", GoalSchema);

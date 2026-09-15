import mongoose from "mongoose";

const TaskSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    title: { type: String, required: true, trim: true },
    notes: { type: String, default: "" },
    priority: { type: String, enum: ["low", "medium", "high"], default: "medium" },
    dueDate: { type: Date },
    completed: { type: Boolean, default: false },
    completedAt: { type: Date }
  },
  { timestamps: true }
);

TaskSchema.index({ user: 1, completed: 1, dueDate: 1 });

export default mongoose.models.Task || mongoose.model("Task", TaskSchema);

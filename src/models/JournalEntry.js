import mongoose from "mongoose";

const JournalEntrySchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    date: { type: String, required: true }, // YYYY-MM-DD
    mood: { type: Number, min: 1, max: 5, default: 3 }, // 1 = rough, 5 = great
    body: { type: String, default: "" }
  },
  { timestamps: true }
);

JournalEntrySchema.index({ user: 1, date: 1 }, { unique: true });

export default mongoose.models.JournalEntry || mongoose.model("JournalEntry", JournalEntrySchema);

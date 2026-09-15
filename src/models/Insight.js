import mongoose from "mongoose";

const InsightSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    generatedAt: { type: Date, default: Date.now },
    items: [
      {
        type: { type: String, required: true }, // e.g. "peak-completion-window"
        headline: { type: String, required: true },
        detail: { type: String, default: "" },
        confidence: { type: String, enum: ["low", "medium", "high"], default: "medium" },
        metric: { type: Number } // the number backing the headline, e.g. 0.8 for "80%"
      }
    ]
  },
  { timestamps: true }
);

export default mongoose.models.Insight || mongoose.model("Insight", InsightSchema);

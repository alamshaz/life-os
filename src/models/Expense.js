import mongoose from "mongoose";

const EXPENSE_CATEGORIES = [
  "food",
  "transport",
  "housing",
  "health",
  "leisure",
  "shopping",
  "subscriptions",
  "other"
];

const ExpenseSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    amount: { type: Number, required: true },
    category: { type: String, enum: EXPENSE_CATEGORIES, default: "other" },
    note: { type: String, default: "" },
    date: { type: String, required: true } // YYYY-MM-DD
  },
  { timestamps: true }
);

ExpenseSchema.index({ user: 1, date: -1 });

export { EXPENSE_CATEGORIES };
export default mongoose.models.Expense || mongoose.model("Expense", ExpenseSchema);

import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    timezone: { type: String, default: "UTC" },
    focusCutoffHour: { type: Number, default: 14 } // used by the insight engine's default "early bird" check
  },
  { timestamps: true }
);

export default mongoose.models.User || mongoose.model("User", UserSchema);

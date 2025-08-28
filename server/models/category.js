import mongoose from "mongoose";

const categorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, unique: true },
    parentId: { type: mongoose.Schema.Types.ObjectId, ref: "Category", default: null }, // תת קטגוריה
    icon: { type: String, default: "" }, // קישור לתמונה
  },
  { timestamps: true }
);

export const Category =
  mongoose.models.Category || mongoose.model("Category", categorySchema);

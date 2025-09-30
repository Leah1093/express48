// models/SearchLog.js
import mongoose from "mongoose";

const searchLogSchema = new mongoose.Schema(
  {
    term: { type: String, required: true, index: true },
    count: { type: Number, default: 1 },
  },
  { timestamps: true }
);

// נגדיר אינדקס לשימוש ב-Aggregation
searchLogSchema.index({ term: 1 });

export const SearchLog = mongoose.model("SearchLog", searchLogSchema);

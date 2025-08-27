import mongoose from "mongoose";

const sellerSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true, index: true },

  companyName: { type: String, required: true, trim: true },
  fullName: { type: String, required: true, trim: true },
  email: { type: String, required: true, trim: true, lowercase: true, index: true },
  roleTitle: { type: String, trim: true },
  phone: { type: String, trim: true },
  categories: [{ type: String, trim: true }],
  notes: { type: String, trim: true },

  status: { type: String, enum: ["new", "approved", "rejected", "suspended"], default: "new", index: true },
  ratings: {
    sum:   { type: Number, default: 0 },
    avg: { type: Number, default: 0 },     // ממוצע כוכבים (0–5)
    count: { type: Number, default: 0 },   // כמות מדרגים
    breakdown: {                           // פיזור דירוגים (כמה נתנו 1–5 כוכבים)
      1: { type: Number, default: 0 },
      2: { type: Number, default: 0 },
      3: { type: Number, default: 0 },
      4: { type: Number, default: 0 },
      5: { type: Number, default: 0 },
    }
  },
  lastAction: {
    by: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    at: { type: Date },
    status: { type: String },
    note: { type: String, trim: true }
  }
}, { timestamps: true });

export const Seller = mongoose.model("Seller", sellerSchema);

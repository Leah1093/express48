import mongoose from "mongoose";
const { Schema, model } = mongoose;

const sellerApplicationSchema = new Schema({
  userId:      { type: Schema.Types.ObjectId, ref: "User" }, // אם המבקש מחובר
  companyName: { type: String, required: true, trim: true },
  fullName:    { type: String, required: true, trim: true },
  email:       { type: String, required: true, lowercase: true, trim: true },
  position:    { type: String, default: "" },
  phone:       { type: String, default: "" },
  categories:  { type: String, default: "" }, // או Array לפי הצורך
  notes:       { type: String, default: "" },

  status:      { type: String, enum: ["pending","approved","rejected"], default: "pending", index: true },
  reviewedBy:  { type: Schema.Types.ObjectId, ref: "User" },
  reviewedAt:  { type: Date },
}, { timestamps: true });

sellerApplicationSchema.index({ email: 1, status: 1 }); // עוזר לסינון מהיר

export const SellerApplication = model("SellerApplication", sellerApplicationSchema);

// models/Favorite.js
import mongoose from "mongoose";

const favoriteSchema = new mongoose.Schema({
  userId:   { type: mongoose.Schema.Types.ObjectId, ref: "User", index: true, required: true },
  productId:{ type: mongoose.Schema.Types.ObjectId, ref: "Product", index: true, required: true },
  variantId:{ type: mongoose.Schema.Types.ObjectId, ref: "ProductVariant" }, // אופציונלי
  addedAt:  { type: Date, default: Date.now }
}, { timestamps: true });

// יוניק כדי שלא יהיו כפולים
favoriteSchema.index({ userId: 1, productId: 1, variantId: 1 }, { unique: true });

export const Favorite = mongoose.model("Favorite", favoriteSchema);

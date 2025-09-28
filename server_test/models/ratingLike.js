// models/RatingLike.js
import mongoose from "mongoose";

const ratingLikeSchema = new mongoose.Schema({
  ratingId: { type: mongoose.Schema.Types.ObjectId, ref: "Rating", required: true, index: true },
  userId:   { type: mongoose.Schema.Types.ObjectId, ref: "User",   required: true, index: true },
  // 1 = like, -1 = dislike (מותר להחליף ביניהם; לא ניתן לבחור את שניהם)
  value:    { type: Number, enum: [1, -1], required: true },
}, { timestamps: true });

// כל משתמש יכול להצביע פעם אחת לכל ביקורת
ratingLikeSchema.index({ ratingId: 1, userId: 1 }, { unique: true });

export const RatingLike = mongoose.models.RatingLike || mongoose.model("RatingLike", ratingLikeSchema);

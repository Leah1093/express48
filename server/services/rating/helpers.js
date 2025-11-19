// services/rating/helpers.js
import mongoose from "mongoose";
export const toObjectId = (id) => new mongoose.Types.ObjectId(String(id));
export const SORT_MAP = { /* מיפוי מיון משותף */ };
export const baseSellerMatch = ({ sellerId, productId, from, to }) => {
  const q = { sellerId: toObjectId(sellerId), status: "approved", deletedAt: null };
  if (productId) q.productId = toObjectId(productId);
  if (from || to) { q.createdAt = {}; if (from) q.createdAt.$gte = new Date(from); if (to) q.createdAt.$lte = new Date(to); }
  return q;
};

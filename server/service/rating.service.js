// services/rating.service.js
import { Rating } from "../models/rating.js";
import { RatingLike } from "../models/rating.js";
import { Product } from "../models/product.js";
import { Seller } from "../models/seller.js";

function applyDeltaToProduct(prod, { addStars = 0, addCount = 0, oldStars = null, newStars = null }) {
  if (!prod) return;
  if (oldStars) prod.ratingBreakdown[oldStars] = Math.max(0, (prod.ratingBreakdown[oldStars] || 0) - 1);
  if (newStars) prod.ratingBreakdown[newStars] = (prod.ratingBreakdown[newStars] || 0) + 1;
  prod.ratingSum   = Math.max(0, prod.ratingSum + addStars);
  prod.ratingCount = Math.max(0, prod.ratingCount + addCount);
  prod.ratingAvg   = prod.ratingCount ? +(prod.ratingSum / prod.ratingCount).toFixed(1) : 0;
}

async function applyDeltaToSeller(sellerId, { addStars = 0, addCount = 0, oldStars = null, newStars = null }) {
  if (!sellerId) return;
  const seller = await Seller.findById(sellerId);
  if (!seller) return;
  seller.applyRatingDelta(addStars, addCount, oldStars, newStars);
  await seller.save();
}

export class RatingService {
  async create({ userId, productId, sellerId, orderId, orderItemId, variationId = null, stars, text = "", images = [], videos = [], anonymous = false, verifiedPurchase = false, productIsActive = true }) {
    if (!(Number.isInteger(stars) && stars >= 1 && stars <= 5)) throw new Error("Stars must be 1..5 int");

    const rating = await Rating.create({
      userId, productId, sellerId, orderId, orderItemId, variationId,
      stars, text, images, videos, anonymous,
      verifiedPurchase, status: "approved",
    });

    const prod = await Product.findById(productId);
    if (prod) {
      applyDeltaToProduct(prod, { addStars: stars, addCount: 1, newStars: stars });
      await prod.save();
    }
    if (productIsActive) {
      await applyDeltaToSeller(sellerId, { addStars: stars, addCount: 1, newStars: stars });
    }

    return rating;
  }

  async edit({ ratingId, userId, stars, text, images, videos, productIsActive = true, updaterUserId = null }) {
    const r = await Rating.findOne({ _id: ratingId, userId, deletedAt: null });
    if (!r) throw new Error("Rating not found");
    if (!r.editableUntil || Date.now() > new Date(r.editableUntil).getTime()) throw new Error("Edit window expired");

    const oldStars = r.stars;
    if (typeof stars === "number") r.stars = stars;
    if (typeof text === "string")  r.text = text;
    if (images) r.images = images;
    if (videos) r.videos = videos;
    r.updatedBy = updaterUserId || userId;
    await r.save();

    if (typeof stars === "number" && stars !== oldStars) {
      const prod = await Product.findById(r.productId);
      if (prod) {
        applyDeltaToProduct(prod, { addStars: stars - oldStars, oldStars, newStars: stars });
        await prod.save();
      }
      if (productIsActive) {
        await applyDeltaToSeller(r.sellerId, { addStars: stars - oldStars, oldStars, newStars: stars });
      }
    }

    return r;
  }

  async adminDelete({ ratingId, adminUserId }) {
    const r = await Rating.findById(ratingId);
    if (!r || r.deletedAt) throw new Error("Rating not found or already deleted");

    if (r.status === "approved") {
      const prod = await Product.findById(r.productId);
      if (prod) {
        applyDeltaToProduct(prod, { addStars: -r.stars, addCount: -1, oldStars: r.stars });
        await prod.save();
      }
      await applyDeltaToSeller(r.sellerId, { addStars: -r.stars, addCount: -1, oldStars: r.stars });
    }

    r.deletedAt = new Date();
    r.deletedBy = adminUserId;
    await r.save();
    return { ok: true };
  }

  async adminRestore({ ratingId, adminUserId }) {
    const r = await Rating.findById(ratingId);
    if (!r || !r.deletedAt) throw new Error("Rating not found or not deleted");

    if (r.status === "approved") {
      const prod = await Product.findById(r.productId);
      if (prod) {
        applyDeltaToProduct(prod, { addStars: r.stars, addCount: 1, newStars: r.stars });
        await prod.save();
      }
      await applyDeltaToSeller(r.sellerId, { addStars: r.stars, addCount: 1, newStars: r.stars });
    }

    r.deletedAt = null;
    r.restoredBy = adminUserId;
    await r.save();
    return { ok: true };
  }

  async like({ ratingId, userId, value }) {
    if (![1, -1].includes(value)) throw new Error("Invalid like value");
    const r = await Rating.findById(ratingId);
    if (!r || r.deletedAt || r.status !== "approved") throw new Error("Rating not available");

    const existing = await RatingLike.findOne({ ratingId, userId });
    if (!existing) {
      await RatingLike.create({ ratingId, userId, value });
      if (value === 1) r.likesCount += 1; else r.dislikesCount += 1;
    } else if (existing.value !== value) {
      if (existing.value === 1) { r.likesCount--; r.dislikesCount++; }
      else { r.dislikesCount--; r.likesCount++; }
      existing.value = value;
      await existing.save();
    }
    await r.save();
    return { likes: r.likesCount, dislikes: r.dislikesCount };
  }

  async listByProduct({ productId, page = 1, pageSize = 20, sort = "new", withMedia = false }) {
    const q = { productId, status: "approved", deletedAt: null };
    if (withMedia) q.hasMedia = true;

    if (sort === "helpful") {
      const pipeline = [
        { $match: q },
        { $addFields: { helpfulScore: { $subtract: ["$likesCount", "$dislikesCount"] } } },
        { $sort: { helpfulScore: -1, createdAt: -1 } },
        { $skip: (page - 1) * pageSize },
        { $limit: pageSize },
      ];
      const [items, total] = await Promise.all([Rating.aggregate(pipeline), Rating.countDocuments(q)]);
      return { items, total, page, pageSize };
    }

    const sortMap = { new:{createdAt:-1}, old:{createdAt:1}, high:{stars:-1,createdAt:-1}, low:{stars:1,createdAt:-1} };
    const [items, total] = await Promise.all([
      Rating.find(q).sort(sortMap[sort] || sortMap.new).skip((page - 1) * pageSize).limit(pageSize),
      Rating.countDocuments(q),
    ]);
    return { items, total, page, pageSize };
  }

  async productSummary({ productId }) {
    const p = await Product.findById(productId).select("ratingAvg ratingCount ratingBreakdown");
    if (!p) throw new Error("Product not found");
    return {
      avg: p.ratingAvg,
      count: p.ratingCount,
      breakdown: {
        1: p.ratingBreakdown?.[1] || 0,
        2: p.ratingBreakdown?.[2] || 0,
        3: p.ratingBreakdown?.[3] || 0,
        4: p.ratingBreakdown?.[4] || 0,
        5: p.ratingBreakdown?.[5] || 0,
      }
    };
  }
}

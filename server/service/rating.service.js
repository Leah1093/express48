import { Rating } from "../models/rating.js";
import { RatingLike } from "../models/rating.js";
import { Product } from "../models/Product.js";
import { Seller } from "../models/seller.js";
import { CustomError } from "../utils/CustomError.js"; // ✅ חובה

function applyDeltaToProduct(prod, { addStars = 0, addCount = 0, oldStars = null, newStars = null }) {
  if (!prod) return;
  const rb = prod.ratingBreakdown || {};
  if (oldStars !== null && oldStars !== undefined)
    rb[oldStars] = Math.max(0, (rb[oldStars] || 0) - 1);
  if (newStars !== null && newStars !== undefined)
    rb[newStars] = (rb[newStars] || 0) + 1;
  prod.ratingBreakdown = rb;
  prod.ratingSum = Math.max(0, (prod.ratingSum || 0) + addStars);
  prod.ratingCount = Math.max(0, (prod.ratingCount || 0) + addCount);
  prod.ratingAvg = prod.ratingCount ? +(prod.ratingSum / prod.ratingCount).toFixed(1) : 0;
  if (typeof prod.markModified === "function") prod.markModified("ratingBreakdown");
}

async function applyDeltaToSeller(sellerId, { addStars = 0, addCount = 0, oldStars = null, newStars = null }) {
  if (!sellerId) return;
  const seller = await Seller.findById(sellerId);
  if (!seller) return;
  if (typeof seller.applyRatingDelta === "function") {
    seller.applyRatingDelta(addStars, addCount, oldStars, newStars);
  }
  await seller.save();
}

export class RatingService {
  async create({ userId, productId, sellerId, stars, text = "", images = [], videos = [], productIsActive = true }) {
    if (!(Number.isInteger(stars) && stars >= 1 && stars <= 5))
      throw new CustomError("Stars must be between 1 and 5", 400);

    const rating = await Rating.create({
      userId, productId, sellerId, stars, text, images, videos,
      hasMedia: Boolean(images?.length || videos?.length),
      status: "approved",
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

  async edit({ ratingId, userId, stars, text, images, videos, productIsActive = true }) {
    const r = await Rating.findOne({ _id: ratingId, userId, deletedAt: null });
    if (!r) throw new CustomError("Rating not found", 404);
    if (r.editableUntil && Date.now() > new Date(r.editableUntil).getTime())
      throw new CustomError("Edit window expired", 403);

    const oldStars = r.stars;
    if (typeof stars === "number") r.stars = stars;
    if (typeof text === "string") r.text = text;
    if (images) r.images = images;
    if (videos) r.videos = videos;
    r.hasMedia = Boolean(r.images?.length || r.videos?.length);
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
    if (!r || r.deletedAt)
      throw new CustomError("Rating not found or already deleted", 404);

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
    if (!r || !r.deletedAt)
      throw new CustomError("Rating not found or not deleted", 404);

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
    if (![1, -1].includes(value)) throw new CustomError("Invalid like value", 400);
    const r = await Rating.findById(ratingId);
    if (!r || r.deletedAt || r.status !== "approved")
      throw new CustomError("Rating not available", 404);

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

  async productSummary({ productId }) {
    const p = await Product.findById(productId).select("ratingAvg ratingCount ratingBreakdown");
    if (!p) throw new CustomError("Product not found", 404);
    const rb = p.ratingBreakdown || {};
    return {
      avg: p.ratingAvg || 0,
      count: p.ratingCount || 0,
      breakdown: { 1: rb[1] || 0, 2: rb[2] || 0, 3: rb[3] || 0, 4: rb[4] || 0, 5: rb[5] || 0 },
    };
  }
}

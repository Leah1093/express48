import { Rating } from "../models/rating.js";
import { RatingLike } from "../models/rating.js";
import { Product } from "../models/product.js";
import { Seller } from "../models/seller.js";
import { CustomError } from "../utils/CustomError.js";

/** --- utils --- **/
function normalizeEditableUntil(editableHours) {
  // undefined/null → ברירת מחדל 48 שעות
  if (editableHours === null || editableHours === undefined) {
    return new Date(Date.now() + 48 * 60 * 60 * 1000);
  }
  // <= 0 → פג תוקף מיידית (כדי שהטסט 403 יעבוד)
  if (editableHours <= 0) {
    return new Date(Date.now() - 1);
  }
  return new Date(Date.now() + editableHours * 60 * 60 * 1000);
}

function applyDeltaToProduct(prod, { addStars = 0, addCount = 0, oldStars = null, newStars = null }) {
  if (!prod) return;

  const rb = prod.ratingBreakdown || {};
  if (oldStars !== null && oldStars !== undefined) {
    rb[oldStars] = Math.max(0, (rb[oldStars] || 0) - 1);
  }
  if (newStars !== null && newStars !== undefined) {
    rb[newStars] = (rb[newStars] || 0) + 1;
  }

  prod.ratingBreakdown = rb;
  prod.ratingSum = Math.max(0, (prod.ratingSum || 0) + addStars);
  prod.ratingCount = Math.max(0, (prod.ratingCount || 0) + addCount);
  prod.ratingAvg = prod.ratingCount ? +(prod.ratingSum / prod.ratingCount).toFixed(1) : 0;

  if (typeof prod.markModified === "function") {
    prod.markModified("ratingBreakdown");
  }
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

/** --- service --- **/
export class RatingService {
  async create({
    userId,
    productId,
    sellerId,
    orderId,
    orderItemId,
    variationId = null,
    stars,
    text = "",
    images = [],
    videos = [],
    anonymous = false,
    verifiedPurchase = false,
    productIsActive = true,
    editableHours, // חשוב: משמש ל־normalizeEditableUntil
  }) {
    if (!(Number.isInteger(stars) && stars >= 1 && stars <= 5)) {
      throw new CustomError("Stars must be between 1 and 5", 400);
    }

    const hasMedia = Boolean((images?.length || 0) + (videos?.length || 0));
    const editableUntil = normalizeEditableUntil(editableHours);

    const rating = await Rating.create({
      userId,
      productId,
      sellerId,
      orderId,
      orderItemId,
      variationId,
      stars,
      text,
      images,
      videos,
      hasMedia,
      anonymous,
      verifiedPurchase,
      status: "approved",
      editableUntil,
    });

    const prod = await Product.findById(productId);
    // לקרוא תמיד → מכסה ענפים של early-return ללא מוצר
    applyDeltaToProduct(prod, { addStars: stars, addCount: 1, newStars: stars });
    if (prod) await prod.save();

    if (productIsActive) {
      await applyDeltaToSeller(sellerId, { addStars: stars, addCount: 1, newStars: stars });
    }
    return rating;
  }

  async edit({ ratingId, userId, stars, text, images, videos, productIsActive = true }) {
    const r = await Rating.findOne({ _id: ratingId, userId, deletedAt: null });
    if (!r) throw new CustomError("Rating not found", 404);

    if (r.editableUntil && Date.now() > new Date(r.editableUntil).getTime()) {
      throw new CustomError("Edit window expired", 403);
    }

    const oldStars = r.stars;
    const starsChanged = typeof stars === "number" && stars !== oldStars;

    if (typeof stars === "number") r.stars = stars;
    if (typeof text === "string") r.text = text;
    if (images) r.images = images;
    if (videos) r.videos = videos;
    r.hasMedia = Boolean((r.images?.length || 0) + (r.videos?.length || 0));
    await r.save();

    if (starsChanged) {
      const prod = await Product.findById(r.productId);
      // לקרוא תמיד (גם כשאין מוצר)
      applyDeltaToProduct(prod, { addStars: r.stars - oldStars, oldStars, newStars: r.stars });
      if (prod) await prod.save();

      if (productIsActive) {
        await applyDeltaToSeller(r.sellerId, { addStars: r.stars - oldStars, oldStars, newStars: r.stars });
      }
    }
    return r;
  }

  async adminDelete({ ratingId, adminUserId }) {
    const r = await Rating.findById(ratingId);
    if (!r || r.deletedAt) throw new CustomError("Rating not found or already deleted", 404);

    if (r.status === "approved") {
      const prod = await Product.findById(r.productId);
      // לקרוא תמיד (גם כשאין מוצר)
      applyDeltaToProduct(prod, { addStars: -r.stars, addCount: -1, oldStars: r.stars });
      if (prod) await prod.save();

      await applyDeltaToSeller(r.sellerId, { addStars: -r.stars, addCount: -1, oldStars: r.stars });
    }

    r.deletedAt = new Date();
    r.deletedBy = adminUserId;
    await r.save();
    return { ok: true };
  }

  async adminRestore({ ratingId, adminUserId }) {
    const r = await Rating.findById(ratingId);
    if (!r || !r.deletedAt) throw new CustomError("Rating not found or not deleted", 404);

    if (r.status === "approved") {
      const prod = await Product.findById(r.productId);
      // לקרוא תמיד (גם כשאין מוצר)
      applyDeltaToProduct(prod, { addStars: r.stars, addCount: 1, newStars: r.stars });
      if (prod) await prod.save();

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
    if (!r || r.deletedAt || r.status !== "approved") throw new CustomError("Rating not available", 404);

    const existing = await RatingLike.findOne({ ratingId, userId });
    if (!existing) {
      await RatingLike.create({ ratingId, userId, value });
      if (value === 1) r.likesCount = Math.max(0, (r.likesCount || 0) + 1);
      else r.dislikesCount = Math.max(0, (r.dislikesCount || 0) + 1);
    } else if (existing.value !== value) {
      if (existing.value === 1) {
        r.likesCount = Math.max(0, (r.likesCount || 0) - 1);
        r.dislikesCount = Math.max(0, (r.dislikesCount || 0) + 1);
      } else {
        r.dislikesCount = Math.max(0, (r.dislikesCount || 0) - 1);
        r.likesCount = Math.max(0, (r.likesCount || 0) + 1);
      }
      existing.value = value;
      await existing.save();
    }

    await r.save();
    return { likes: r.likesCount || 0, dislikes: r.dislikesCount || 0 };
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

    const sortMap = {
      new: { createdAt: -1 },
      old: { createdAt: 1 },
      high: { stars: -1, createdAt: -1 },
      low: { stars: 1, createdAt: -1 },
    };

    const [items, total] = await Promise.all([
      Rating.find(q).sort(sortMap[sort] || sortMap.new).skip((page - 1) * pageSize).limit(pageSize),
      Rating.countDocuments(q),
    ]);

    return { items, total, page, pageSize };
  }

  async productSummary({ productId }) {
    // קודם להביא מסמך, לבדוק null, ורק אז select אם קיים (תואם גם למוק)
    const doc = await Product.findById(productId);
    if (!doc) throw new CustomError("Product not found", 404);

    const p = typeof doc.select === "function"
      ? await doc.select("ratingAvg ratingCount ratingBreakdown")
      : doc;

    const rb = p.ratingBreakdown || {};
    return {
      avg: p.ratingAvg || 0,
      count: p.ratingCount || 0,
      breakdown: {
        1: rb[1] || 0,
        2: rb[2] || 0,
        3: rb[3] || 0,
        4: rb[4] || 0,
        5: rb[5] || 0,
      },
    };
  }
}

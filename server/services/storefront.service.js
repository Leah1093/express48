import mongoose from "mongoose";
import { CustomError } from "../utils/CustomError.js";
import { Product } from "../models/Product.js";

const MAX_LIMIT = 100;

function toPosIntOrThrow(v, name) {
  const n = Number(v);
  if (!Number.isFinite(n) || !Number.isInteger(n) || n < 1) {
    throw new CustomError(`${name} must be a positive integer`, 400);
  }
  return n;
}

export class StorefrontService {
  async listPublished({ q, page = 1, limit = 20 } = {}) {
    // validate
    page = toPosIntOrThrow(page, "page");
    limit = toPosIntOrThrow(limit, "limit");
    if (limit > MAX_LIMIT) {
      throw new CustomError(`limit must be <= ${MAX_LIMIT}`, 400);
    }

    const query = { status: "published", isDeleted: false };
    if (q && typeof q === "string" && q.trim()) {
      query.$text = { $search: q.trim() };
    }

    try {
      const findChain = Product.find(query).sort("-publishedAt").skip((page - 1) * limit).limit(limit).lean();
      const [items, total] = await Promise.all([
        findChain,
        Product.countDocuments(query),
      ]);

      const pages = Math.max(1, Math.ceil((total || 0) / limit));
      return { items, total, page, pages };
    } catch (err) {
      throw new CustomError(`DB error: ${err.message}`, 500);
    }
  }

  async getOnePublic(idOrSlug) {
    if (!idOrSlug || typeof idOrSlug !== "string") {
      throw new CustomError("idOrSlug is required", 400);
    }

    const base = { isDeleted: false, status: "published" };
    const isObjectId = mongoose.Types.ObjectId.isValid(idOrSlug);
    const filter = isObjectId ? { ...base, _id: idOrSlug } : { ...base, slug: idOrSlug };

    try {
      const doc = await Product.findOne(filter).lean();
      if (!doc) throw new CustomError("Product not found", 404);
      return doc;
    } catch (err) {
      if (err instanceof CustomError) throw err;
      throw new CustomError(`DB error: ${err.message}`, 500);
    }
  }
}

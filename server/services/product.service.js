import { Product } from "../models/Product.js";
import { CustomError } from "../utils/CustomError.js";

import { SearchLog } from "../models/SearchLog.js";
import CategoryModel, { Category } from "../models/category.js"; // לפי הנתיב שלך


// פונקציית עזר
function isNewProduct(publishedAt) {
  if (!publishedAt) return false;
  const days = (Date.now() - new Date(publishedAt)) / (1000 * 60 * 60 * 24);
  return days <= 12;
}

class ProductService {
  async listNewProducts(limit = 24) {
    if (typeof limit !== "number" || limit <= 0) {
      throw new CustomError("Limit must be a positive number", 400);
    }

    const now = new Date();
    const twelveDaysAgo = new Date(now.getTime() - 12 * 24 * 60 * 60 * 1000);

    try {
      const query = {
        status: "published",
        publishedAt: { $gte: twelveDaysAgo }
      };

      const products = await Product.find(query)
        .sort({ publishedAt: -1 })
        .limit(limit)
        .select("title images price currency slug _id storeId discount publishedAt")
        .lean({ virtuals: true });

      return products.map((p) => {

        const { finalAmount, baseAmount, savedAmount, hasDiscount } =
          Product.hydrate(p).getEffectivePricing();

        return {
          _id: p._id,
          title: p.title,
          slug: p.slug,
          images: p.images,
          currency: p.currency,
          basePrice: baseAmount,
          finalPrice: finalAmount,
          discountValue: hasDiscount ? savedAmount : 0,
          hasDiscount,

          isNew: p.publishedAt ? isNewProduct(p.publishedAt) : false
        };
      });
    } catch (err) {
      throw new CustomError(err.message || "Error listing new products", err.status || 500);
    }
  }

  async getByFullSlugService({ fullSlug, page = 1, limit = 24, sort }) {
    const p = Math.max(1, Number(page) || 1);
    const l = Math.min(100, Math.max(1, Number(limit) || 24));
    const skip = (p - 1) * l;

    const base = String(fullSlug || "").trim();
    const escaped = base.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

    const filter = {
      isDeleted: false,
      status: "published",
      $or: [
        { categoryFullSlug: base },
        { categoryFullSlug: { $regex: `^${escaped}/` } },
      ],
    };

    const sortStage = sort || { updatedAt: -1 };

    const [items, total] = await Promise.all([
      Product.find(filter)
        .sort(sortStage)
        .skip(skip)
        .limit(l)
        .select({
          _id: 1,
          slug: 1,
          title: 1,
          storeId: 1,
          images: 1,
          currency: 1,
          price: 1,
          discount: 1,
          description: 1,
        })
        .populate("storeId", "slug") // נקבל storeId.slug
        .lean(),
      Product.countDocuments(filter),
    ]);


    const pages = Math.ceil(total / l) || 1;

    return {
      items,
      meta: {
        page: p,
        pages,
        total,
        limit: l,
      },
    };
  }


  async getProductBySlugService(slug) {
    return Product.findOne({ slug, isDeleted: false, status: "published" }).lean();
  }


  // services/product.service.js

  getAllProductsService = async ({ page = 1, limit = 24, sort } = {}) => {
    try {
      const p = Math.max(1, Number(page) || 1);
      const l = Math.min(100, Math.max(1, Number(limit) || 24));
      const skip = (p - 1) * l;

      const filter = {
        isDeleted: false,
        status: "published",
      };

      const sortStage = sort || { updatedAt: -1 };

      const [items, total] = await Promise.all([
        Product.find(filter)
          .sort(sortStage)
          .skip(skip)
          .limit(l)
          .select({
            _id: 1,
            slug: 1,
            title: 1,
            storeId: 1,
            images: 1,
            currency: 1,
            price: 1,
            discount: 1,
            description: 1,
            stock: 1,
            inStock: 1,
            brand:1,
          })
          .populate("storeId", "slug") // נקבל storeId.slug
          .lean(),
        Product.countDocuments(filter),
      ]);


      const pages = Math.ceil(total / l) || 1;
      return {
        items,
        meta: {
          page: p,
          pages,
          total,
          limit: l,
        },
      };
    } catch (err) {
      console.error("[getAllProductsService] error:", err);
      throw err instanceof CustomError
        ? err
        : new CustomError(
          err.message || "Error fetching products",
          err.status || 500
        );
    }
  };



  searchProductsService = async ({ search, page = 1, limit = 20 }) => {
    const p = Math.max(1, Number(page) || 1);
    const l = Math.max(1, Number(limit) || 20);
    const skip = (p - 1) * l;

    const match = {};
    if (search && search.trim()) {
      const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const normalizeHebrew = (str = "") => {
        const FINAL_MAP = { "ך": "כ", "ם": "מ", "ן": "נ", "ף": "פ", "ץ": "צ" };
        let s = String(str)
          .replace(/[\u0591-\u05C7]/g, "")
          .replace(/[\u05F3\u05F4'"]/g, "")
          .replace(/[^\u0590-\u05FF0-9A-Za-z\s-]/g, " ")
          .replace(/\s+/g, " ")
          .trim();
        s = s.replace(/[ךםןףץ]/g, ch => FINAL_MAP[ch] || ch);
        return s.toLowerCase();
      };
      const q = escapeRegex(search.trim());
      const qHe = normalizeHebrew(search.trim());
      match.$or = [
        { title: new RegExp(q, "i") },
        { brand: new RegExp(q, "i") },
        { model: new RegExp(q, "i") },
        { sku: new RegExp(q, "i") },
        { gtin: search.trim() },
        { slug: new RegExp(q, "i") },
        { slug: search.trim() },
        { "variations.sku": new RegExp(q, "i") },
        { "variations.gtin": search.trim() },
        { title_he_plain: new RegExp(escapeRegex(qHe), "i") },
        { brand_he_plain: new RegExp(escapeRegex(qHe), "i") },
        { model_he_plain: new RegExp(escapeRegex(qHe), "i") },
        { description_he_plain: new RegExp(escapeRegex(qHe), "i") },
      ];
    }

    try {

      if (search && search.trim()) {
        await SearchLog.findOneAndUpdate(
          { term: search.trim().toLowerCase() },
          { $inc: { count: 1 } },
          { upsert: true, new: true }
        );
      }
      const products = await Product.find(match)
        .sort({ updatedAt: -1 })
        .skip(skip)
        .limit(l)
        .populate("storeId");

      const total = await Product.countDocuments(match);
      return { items: products, page: p, limit: l, total, hasNextPage: skip + products.length < total };
    } catch (err) {
      throw new CustomError(err.message || "Error searching products", err.status || 500);
    }
  };

  getPopularSearches = async (limit = 10) => {
    try {
      const terms = await SearchLog.find({})
        .sort({ count: -1 })
        .limit(limit)
        .select("term count -_id");

      return terms;
    } catch (err) {
      throw new CustomError(err.message || "Error fetching popular searches", err.status || 500);
    }
  };

}

export const productService = new ProductService();

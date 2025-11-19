import { productService } from "../services/product.service.js";
import { CustomError } from "../utils/CustomError.js";
import { Product } from "../models/product.js";

export class ProductController {
  async getNewProducts(req, res, next) {
    try {
      const limit = parseInt(req.query.limit, 10) || 12;
      const products = await productService.listNewProducts(limit);
      res.json({ items: products });
    } catch (err) {
      next(new CustomError("שגיאה בשליפת מוצרים חדשים", 500));
    }
  }

  getAllProducts = async (req, res, next) => {
    try {
      const products = await productService.getAllProductsService();
      res.json(products);
    } catch (err) {
      next(new CustomError("שגיאה בשליפת מוצרים", 500));
    }
  };

  searchProducts = async (req, res, next) => {
    try {
      const { search, page = 1, limit = 20 } = req.query;
      const result = await productService.searchProductsService({
        search,
        page,
        limit,
      });
      res.json(result);
    } catch (err) {
      next(new CustomError("שגיאה בחיפוש מוצרים", 500));
    }
  };

  getPopularSearches = async (req, res, next) => {
    try {
      const limit = Number(req.query.limit) || 10;
      const data = await productService.getPopularSearches(limit);
      res.json({ items: data });
    } catch (err) {
      next(err);
    }
  };
  getByCategory = async (req, res, next) => {

    try {
      const fullSlug = decodeURIComponent(req.params[0] || "").trim();
      if (!fullSlug) {
        return res.status(400).json({ error: "fullSlug is required" });
      }

      const pageNum = Math.max(1, Number(req.query.page) || 1);
      const perPage = Math.min(100, Math.max(1, Number(req.query.limit) || 24));

      // שימי לב: השדה צריך להתאים לסכמה שלך!
      // אם את שומרת fullSlug בשדה product.categoryFullSlug:
      const filter = {
        isDeleted: false,
        status: "published",
        categoryFullSlug: fullSlug,
      };

      const [itemsRaw, total] = await Promise.all([
        Product.find(filter)
          .select("title brand price images slug storeId")
          .populate("storeId", "slug")
          .sort({ updatedAt: -1 })
          .skip((pageNum - 1) * perPage)
          .limit(perPage)
          .lean(),
        Product.countDocuments(filter),
      ]);

      const items = itemsRaw.map((p) => ({
        ...p,
        images: Array.isArray(p.images) ? p.images[0] || "" : p.images || "",
      }));

      res.json({
        items,
        page: pageNum,
        limit: perPage,
        total,
        pages: Math.ceil(total / perPage),
        hasMore: pageNum * perPage < total,
      });
    } catch (err) {
      next(new CustomError("שגיאה בשליפת מוצרים לפי קטגוריה", 500));
    }
  };

  // ודאי שאין כפילות של אותה מתודה פעמיים:
  getProductsBySlug = async (req, res, next) => {
    try {
      const { slug } = req.params;
      const product = await productService.getProductBySlugService(slug);
      if (!product) return next(new CustomError("מוצר לא נמצא", 404));
      res.json(product);
    } catch (err) {
      next(
        err instanceof CustomError
          ? err
          : new CustomError("שגיאה בשליפת מוצר", 500)
      );
    }
  };

  getByFullSlug = async (req, res, next) => {
    console.log('getByFullSlug fullSlug =', req.query.fullSlug);
    try {
      const { fullSlug = "", page = 1, limit = 24, sort } = req.query;
      if (!fullSlug) return next(new CustomError("fullSlug חובה", 400));
      const result = await productService.getByFullSlugService({
        fullSlug,
        page: Number(page) || 1,
        limit: Number(limit) || 24,
        sort,
      });
      res.json(result);
    } catch (err) {
      next(
        err instanceof CustomError
          ? err
          : new CustomError("שגיאה בשליפת מוצרים לפי קטגוריה", 500)
      );
    }
  };

}

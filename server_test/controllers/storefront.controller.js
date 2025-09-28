// controllers/storefront.controller.js
import { StorefrontService } from "../services/storefront.service.js";
const service = new StorefrontService();

export class StorefrontController {
  list = async (req, res, next) => {
    try {
      const { q, page = 1, limit = 20 } = req.query;
      const data = await service.listPublished({
        q,
        page: Number(page),
        limit: Math.min(Number(limit), 100),
      });
      res.set("Cache-Control", "public, max-age=60, stale-while-revalidate=120");
      res.json(data);
    } catch (e) { next(e); }
  };

  getOne = async (req, res, next) => {
    try {
      const doc = await service.getOnePublic(req.params.idOrSlug);
      if (!doc) return res.status(404).json({ ok: false, error: "Product not found" });
      res.set("Cache-Control", "public, max-age=120, stale-while-revalidate=300");
      res.json(doc);
    } catch (e) { next(e); }
  };
}

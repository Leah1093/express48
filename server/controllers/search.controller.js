import { searchService } from "../services/search.service.js";

export class SearchController {
  static async suggest(req, res, next) {
    try {
      const { q = "", limit, storeId, mode } = req.query;
      const strict = mode === "strict";
      const suggestions = await searchService.suggest({
        q,
        limit: Number(limit) || 8,
        storeId,
        strict,
      });
      res.json(suggestions);
    } catch (e) { next(e); }
  }

  static async quick(req, res, next) {
    try {
      const { q = "", limit, storeId, mode } = req.query;
      const strict = mode === "strict";
      const items = await searchService.quick({
        q,
        limit: Number(limit) || 4,
        storeId,
        strict,
      });
      res.json(items); 
    } catch (e) { next(e); }
  }

  static async results(req, res, next) {
    try {
      const { q = "", page, limit, storeId, mode } = req.query;
      const strict = mode === "strict";
      const data = await searchService.results({
        q,
        page,
        limit,
        storeId,
        strict,
      });
      res.json(data); 
    } catch (e) { next(e); }
  }
}

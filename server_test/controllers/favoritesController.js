
import { favoritesService } from "../service/favoritesService.js";
import httpError from "http-errors";

export class FavoritesController {
  // הוספה למועדפים
  add = async (req, res, next) => {
    try {
      const userId = req.user.userId;
      const { productId } = req.body;

      if (!userId || !productId) throw httpError(400, "userId ו־productId נדרשים");

      const favorite = await favoritesService.add(userId, productId);
      res.status(201).json({ ok: true, favorite });
    } catch (err) {
      next(err); // עובר למידלוור טיפול שגיאות
    }
  };

  // הסרה ממועדפים
  remove = async (req, res, next) => {
    try {
      const userId = req.user.userId;
      const { productId } = req.params;

      if (!userId || !productId) throw httpError(400, "userId ו־productId נדרשים");

      const result = await favoritesService.remove(userId, productId);
      res.json(result);
    } catch (err) {
      next(err);
    }
  };

  // רשימת מועדפים
  list = async (req, res, next) => {
    try {
      const userId = req.user.userId;
      const { limit, skip } = req.query;

      if (!userId) throw httpError(401, "חובה להיות מחובר");

      const items = await favoritesService.list(userId, {
        limit: Number(limit) || 200,
        skip: Number(skip) || 0,
      });

      res.json({ ok: true, items });
    } catch (err) {
      next(err);
    }
  };

  // בדיקת קיום
  exists = async (req, res, next) => {
    try {
      const userId = req.user?.id || req.user?._id;
      const { productId } = req.query;

      if (!userId || !productId) throw httpError(400, "userId ו־productId נדרשים");

      const exists = await favoritesService.exists(userId, productId);
      res.json({ ok: true, exists });
    } catch (err) {
      next(err);
    }
  };

  merge = async (req, res, next) => {
    try {
      const userId = req.user.userId; // כמו אצלך ב-list
      if (!userId) throw httpError(401, "חובה להיות מחובר");

      // מהקליינט נקבל items בפורמט: [{ productId: "....", addedAt: "..." }, ...]
      const items = Array.isArray(req.body.items) ? req.body.items : [];

      const merged = await favoritesService.merge(userId, items);

      res.json({ ok: true, items: merged });
    } catch (err) {
      next(err);
    }
  };
}

// export const favoritesController = new FavoritesController();

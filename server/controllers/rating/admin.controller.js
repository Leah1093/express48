import { RatingAdminService } from "../../services/rating/admin.service.js";

export class RatingAdminController {
  static async list(req, res, next) {
    try {
      const { page, limit, sort, ...filters } = req.query;
      const data = await RatingAdminService.list({
        page,
        limit,
        sort,
        filters,
      });
      res.json({ ok: true, ...data });
    } catch (err) {
      next(err);
    }
  }

  static async changeStatus(req, res, next) {
    try {
      const rating = await RatingAdminService.changeStatus({
        ratingId: req.params.id,
        status: req.body.status,
        adminId: req.userId,
      });
      res.json({ ok: true, rating });
    } catch (err) {
      next(err);
    }
  }

  static async changeSellerReplyStatus(req, res, next) {
    try {
      const rating = await RatingAdminService.changeSellerReplyStatus({
        ratingId: req.params.id,
        visible: req.body.visible,
        adminId: req.userId,
      });
      res.json({ ok: true, rating });
    } catch (err) {
      next(err);
    }
  }
}

// controllers/rating/customer.controller.js
import { RatingCustomerService } from "../../services/rating/customer.service.js";

export class RatingCustomerController {
    static async createRating(req, res, next) {
        try {
            const userId = req.userId; // מגיע מ-auth
            const rating = await RatingCustomerService.createRating({ userId, payload: req.body, });
            res.status(201).json({ ok: true, rating });
        } catch (err) { next(err); }
    }

    static async updateRatingByOwner(req, res, next) {
        try {
            const userId = req.userId;
            const ratingId = req.params.id;           // :id מהנתיב
            const rating = await RatingCustomerService.updateRatingByOwner({ userId, ratingId, patch: req.body, });
            res.json({ ok: true, rating });
        } catch (err) { next(err); }
    }
    
    static async listMyRatings(req, res, next) {
        try {
            const userId = req.userId;
            const { page, limit, sort, productId, hasMedia } = req.query; // עבר validate
            const data = await RatingCustomerService.listMyRatings({ userId, page, limit, sort, productId, hasMedia });
            res.json(data);
        } catch (err) { next(err); }
    }

    static async getMyRatingById(req, res, next) {
    try {
      const userId = req.userId;
      const { id } = req.params; // עבר validate(getMyRatingParamsSchema, "params")
      const rating = await RatingCustomerService.getMyRatingById({ userId, ratingId: id });
      res.json({ ok: true, rating });
    } catch (err) { next(err); }
  }
}

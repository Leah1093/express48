// controllers/rating/helpful.controller.js
import { RatingHelpfulService } from "../../services/rating/helpful.service.js";

export class RatingHelpfulController {
  static async toggleVote(req, res, next) {
    try {
      const userId = req.userId;
      const ratingId = req.params.id;
      const { action } = req.body; // "like" או "dislike"
      const result = await RatingHelpfulService.toggleVote({ userId, ratingId, action });
      res.json({ ok: true, ...result });
    } catch (err) { next(err); }
  }
}

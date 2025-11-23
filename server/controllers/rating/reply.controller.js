import { RatingReplyService } from "../../service/rating/reply.service.js";

export class RatingReplyController {
    // POST /seller/ratings/:id/reply
    static async createSellerReply(req, res, next) {
        try {
            const ratingId = req.params.id;
            const sellerId = req.user.sellerId; // מגיע מ-isSellerMiddleware
            const userId = req.userId;     // הנציג שענה
            const { reply } = req.body;      // עבר Zod: createSellerReplySchema
            const sellerReply = await RatingReplyService.createReply({ ratingId, sellerId, userId, text: reply });
            res.status(201).json({ ok: true, sellerReply });
        } catch (err) { next(err); }
    }


    static async updateSellerReply(req, res, next) {
        try {
            const ratingId = req.params.id;
            const sellerId = req.user.sellerId; // מגיע מ-isSellerMiddleware
            const userId = req.userId;     // נציג המוכר שעורך
            const { reply } = req.body;      // עבר validate(updateSellerReplySchema)
            const sellerReply = await RatingReplyService.updateReply({ ratingId, sellerId, userId, text: reply });
            res.json({ ok: true, sellerReply });
        } catch (err) { next(err); }
    }

    static async setSellerReplyVisibility(req, res, next) {
        try {
            const ratingId = req.params.id;
            const sellerId = req.user.sellerId; // מ-isSellerMiddleware
            const userId = req.userId;
            const { visible } = req.body; // עבר validate(sellerReplyVisibilitySchema)

            const sellerReply = await RatingReplyService.setVisibility({ ratingId, sellerId, userId, visible });

            res.json({ ok: true, sellerReply });
        } catch (err) { next(err); }
    }

    static async softDeleteSellerReply(req, res, next) {
        try {
            const ratingId = req.params.id;
            const sellerId = req.user.sellerId;
            const userId = req.userId;

            const sellerReply = await RatingReplyService.softDeleteReply({ ratingId, sellerId, userId });

            res.json({ ok: true, sellerReply });
        } catch (err) { next(err); }
    }

    static async restoreSellerReply(req, res, next) {
        try {
            const ratingId = req.params.id;
            const sellerId = req.user.sellerId; // מ-isSellerMiddleware
            const userId = req.userId;

            const sellerReply = await RatingReplyService.restoreReply({ ratingId, sellerId, userId });
            res.json({ ok: true, sellerReply });
        } catch (err) { next(err); }
    }
}

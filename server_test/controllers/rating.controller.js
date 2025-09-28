import { RatingService } from "../service/rating.service.js";

export class RatingController {
    async create(req, res, next) {
        try {
            const ratingService = new RatingService();
            const userId = req.user._id;
            const { productId, orderId, orderItemId, variationId = null, stars, text = "", images = [], videos = [], anonymous = false } = req.body;
            const { sellerId, productIsActive, verifiedPurchase } = req._ratingContext || {};
            const rating = await ratingService.create({ userId, productId, sellerId, orderId, orderItemId, variationId, stars, text, images, videos, anonymous, verifiedPurchase, productIsActive });
            res.json({ ok: true, rating });
        } catch (err) { next(err); }
    }

    async edit(req, res, next) {
        try {
            const ratingService = new RatingService();
            const userId = req.user._id;
            const { ratingId } = req.params;
            const { stars, text, images, videos } = req.body;
            const rating = await ratingService.edit({ ratingId, userId, stars, text, images, videos, productIsActive: true, updaterUserId: userId });
            res.json({ ok: true, rating });
        } catch (err) { next(err); }
    }

    async like(req, res, next) {
        try {
            const ratingService = new RatingService();
            const userId = req.user._id;
            const { ratingId } = req.params;
            const value = Number(req.body.value);
            const out = await ratingService.like({ ratingId, userId, value });
            res.json({ ok: true, ...out });
        } catch (err) { next(err); }
    }

    async adminDelete(req, res, next) {
        try {
            const ratingService = new RatingService();
            const adminUserId = req.user._id;
            const { ratingId } = req.params;
            const out = await ratingService.adminDelete({ ratingId, adminUserId });
            res.json(out);
        } catch (err) { next(err); }
    }

    async adminRestore(req, res, next) {
        try {
            const ratingService = new RatingService();
            const adminUserId = req.user._id;
            const { ratingId } = req.params;
            const out = await ratingService.adminRestore({ ratingId, adminUserId });
            res.json(out);
        } catch (err) { next(err); }
    }

    async listByProduct(req, res, next) {
        try {
            const ratingService = new RatingService();
            const { productId } = req.params;
            const { page = 1, pageSize = 20, sort = "new", withMedia } = req.query;
            const out = await ratingService.listByProduct({ productId, page: Number(page), pageSize: Number(pageSize), sort, withMedia: withMedia === "true" });
            res.json(out);
        } catch (err) { next(err); }
    }

    async productSummary(req, res, next) {
        try {
            const ratingService = new RatingService();
            const { productId } = req.params;
            const out = await ratingService.productSummary({ productId });
            res.json(out);
        } catch (err) { next(err); }
    }
}

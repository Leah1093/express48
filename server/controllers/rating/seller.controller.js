import {RatingSellerService} from "../../service/rating/seller.service.js"
export class RatingSellerController {
    static async listSellerRatings(req, res, next) {
        try {
            const sellerId = req.user.sellerId; // מגיע מ-isSellerMiddleware
            const { page, limit, sort, stars, hasComment, hasMedia, productId, from, to } = req.query; // כבר עבר validate(Zod)

            const data = await RatingSellerService.listSellerRatings({
                sellerId, page, limit, sort, stars, hasComment, hasMedia, productId, from, to
            });

            res.json(data);
        } catch (err) { next(err); }
    }

    static async getSellerRatingsStats(req, res, next) {
        try {
            const sellerId = req.user.sellerId;
            const { productId, from, to } = req.query; // כבר עבר validate(Zod)
            const stats = await RatingSellerService.getSellerRatingsStats({ sellerId, productId, from, to });
            res.json(stats);
        } catch (err) { next(err); }
    }
}

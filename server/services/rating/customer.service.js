import mongoose from "mongoose";
import { Rating } from "../../models/rating.js";
import { Order } from "../../models/order.js"; // תוודאי שזה השם אצלך
import { RatingsRollupService } from "./ratingsRollup.service.js";

const toId = (v) => new mongoose.Types.ObjectId(String(v));
const clampStars = (n) => Math.max(1, Math.min(5, Number(n)));

export class RatingCustomerService {

    static async createRating({ userId, payload }) {
        const {
            productId, sellerId, orderId, orderItemId, variationId,
            stars, text = "", images = [], videos = [], anonymous = false,
        } = payload;

        const session = await mongoose.startSession();
        try {
            let created;
            await session.withTransaction(async () => {
                // 1. בדיקת בעלות על ההזמנה
                const order = await Order.findOne({ _id: toId(orderId), userId: toId(userId) })
                    .select({ items: 1, sellerId: 1 })
                    .lean()
                    .session(session);
                if (!order) {
                    const e = new Error("Order not found or not owned by user");
                    e.status = 403; throw e;
                }

                // 2. שורת ההזמנה
                const item = order.items?.find((it) => String(it._id) === String(orderItemId));
                if (!item) {
                    const e = new Error("Order item not found");
                    e.status = 404; throw e;
                }

                // 3. אימות שיוכים
                if (String(item.productId) !== String(productId)) {
                    const e = new Error("Order item does not match productId");
                    e.status = 400; throw e;
                }
                if (String(order.sellerId ?? item.sellerId) !== String(sellerId)) {
                    const e = new Error("Order seller does not match sellerId");
                    e.status = 400; throw e;
                }
                if (variationId && String(item.variationId ?? "") !== String(variationId)) {
                    const e = new Error("Order item does not match variationId");
                    e.status = 400; throw e;
                }

                // 4. מניעת כפילות
                const exists = await Rating.exists({ orderItemId: toId(orderItemId) }).session(session);
                if (exists) {
                    const e = new Error("Rating already exists for this order item");
                    e.status = 409; throw e;
                }

                // 5. יצירה
                const docs = await Rating.create([{
                    productId: toId(productId),
                    sellerId: toId(sellerId),
                    userId: toId(userId),
                    orderId: toId(orderId),
                    orderItemId: toId(orderItemId),
                    variationId: variationId ? toId(variationId) : null,
                    stars: clampStars(stars),
                    text, images, videos,
                    verifiedPurchase: true,
                    anonymous,
                    status: "approved", // או "pending" בהתאם למדיניות אישור
                }], { session });

                const r = docs[0];

                const delta = RatingsRollupService.deltas.onCreateApproved(r.stars);
                await RatingsRollupService.applyOnProduct({ productId: r.productId, delta, session });
                await RatingsRollupService.applyOnSeller({ sellerId: r.sellerId, delta, session });


                created = r._id;
            });

            // שליפה נקייה להחזרה
            return await Rating.findById(created).lean();
        } finally {
            session.endSession();
        }
    }

    static async updateRatingByOwner({ userId, ratingId, patch }) {
        const session = await mongoose.startSession();
        try {
            let out;
            await session.withTransaction(async () => {
                const rating = await Rating.findById(toId(ratingId)).session(session);
                if (!rating) { const e = new Error("Rating not found"); e.status = 404; throw e; }
                if (String(rating.userId) !== String(userId)) { const e = new Error("Not allowed"); e.status = 403; throw e; }

                // חלון עריכה (אם קיים במודל)
                if (rating.editableUntil && Date.now() > new Date(rating.editableUntil).getTime()) {
                    const e = new Error("Edit window expired");
                    e.status = 423; throw e;
                }

                const oldStars = rating.stars;

               if (patch.stars !== undefined) rating.stars = clampStars(patch.stars);
                if (patch.text !== undefined) rating.text = String(patch.text).trim();
                if (patch.images !== undefined) rating.images = patch.images;
                if (patch.videos !== undefined) rating.videos = patch.videos;
                if (patch.anonymous !== undefined) rating.anonymous = !!patch.anonymous;

                rating.updatedBy = toId(userId);
                await rating.save({ session });

                // דלתא רק אם כוכבים השתנו
                if (patch.stars !== undefined && oldStars !== rating.stars) {
                    const delta = RatingsRollupService.deltas.onStarsChangeWithinApproved(oldStars, rating.stars);
                    await RatingsRollupService.applyOnProduct({ productId: rating.productId, delta, session });
                    await RatingsRollupService.applyOnSeller({ sellerId: rating.sellerId, delta, session });
                }

                out = rating.toObject();
            });
            return out;
        } finally {
            session.endSession();
        }
    }

    static async listMyRatings({ userId, page = 1, limit = 10, sort = "-createdAt", productId, hasMedia }) {
        const q = { userId: toId(userId)};
        if (productId) q.productId = toId(productId);
        if (hasMedia !== undefined) q.hasMedia = !!hasMedia;

        const SORT = {
            "createdAt": { createdAt: 1 },
            "-createdAt": { createdAt: -1 },
            "stars": { stars: 1 },
            "-stars": { stars: -1 },
        }[sort] || { createdAt: -1 };

        const [items, total] = await Promise.all([
            Rating.find(q)
                .sort(SORT)
                .skip((page - 1) * limit)
                .limit(limit)
                .select({
                    stars: 1, text: 1, images: 1, videos: 1, hasMedia: 1,
                    createdAt: 1, productId: 1, sellerId: 1, likesCount: 1, dislikesCount: 1,
                    editableUntil: 1, status: 1, anonymous: 1,
                    "sellerReply.text": 1, "sellerReply.visible": 1, "sellerReply.deletedAt": 1,
                })
                .lean(),
            Rating.countDocuments(q),
        ]);

        return {
            items,
            page: Number(page),
            limit: Number(limit),
            total,
            totalPages: Math.max(1, Math.ceil(total / limit)),
        };
    }

    static async getMyRatingById({ userId, ratingId }) {
        const rating = await Rating.findOne({ _id: toId(ratingId), userId: toId(userId) })
            .select({
                stars: 1, text: 1, images: 1, videos: 1, hasMedia: 1,
                createdAt: 1, updatedAt: 1, editableUntil: 1,
                productId: 1, sellerId: 1, likesCount: 1, dislikesCount: 1,
                status: 1, anonymous: 1,
                "sellerReply.text": 1, "sellerReply.visible": 1, "sellerReply.deletedAt": 1, "sellerReply.createdAt": 1,
            })
            .lean();

        if (!rating) {
            const e = new Error("Rating not found");
            e.status = 404; throw e;
        }
        return rating;
    }
}

import mongoose from "mongoose";
import { Rating } from "../../models/rating.js";

const toId = (v) => new mongoose.Types.ObjectId(String(v));

export class RatingAdminService {
    static async list({ page = 1, limit = 20, sort = "-createdAt", filters = {} }) {
        const q = {};
        if (filters.productId) q.productId = toId(filters.productId);
        if (filters.sellerId) q.sellerId = toId(filters.sellerId);
        if (filters.userId) q.userId = toId(filters.userId);
        if (filters.status) q.status = filters.status;
        if (filters.from || filters.to) {
            q.createdAt = {};
            if (filters.from) q.createdAt.$gte = new Date(filters.from);
            if (filters.to) q.createdAt.$lte = new Date(filters.to);
        }
        if (filters.hasMedia !== undefined) q.hasMedia = !!filters.hasMedia;
        if (filters.stars) q.stars = filters.stars;

        const SORT = { "-createdAt": { createdAt: -1 }, "createdAt": { createdAt: 1 } }[sort] || { createdAt: -1 };

        const [items, total] = await Promise.all([
            Rating.find(q).sort(SORT).skip((page - 1) * limit).limit(limit).lean(),
            Rating.countDocuments(q)
        ]);

        return { items, page, limit, total, totalPages: Math.ceil(total / limit) };
    }

    static async changeStatus({ ratingId, status, adminId }) {
        const rating = await Rating.findById(toId(ratingId));
        if (!rating) throw Object.assign(new Error("Rating not found"), { status: 404 });
        rating.status = status;
        rating.updatedBy = toId(adminId);
        await rating.save();
        return rating.toObject();
    }


    static async changeSellerReplyStatus({ ratingId, visible, adminId }) {
        const rating = await Rating.findById(toId(ratingId));
        if (!rating || !rating.sellerReply) throw Object.assign(new Error("Seller reply not found"), { status: 404 });
        rating.sellerReply.visible = visible;
        rating.updatedBy = toId(adminId);
        await rating.save();
        return rating.toObject();
    }


}

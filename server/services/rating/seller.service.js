import mongoose from "mongoose";
import { Rating } from "../../models/rating.js";

const SORT_MAP = {
    "createdAt": { createdAt: 1 },
    "-createdAt": { createdAt: -1 },
    "stars": { stars: 1 },
    "-stars": { stars: -1 },
    "likesCount": { likesCount: 1 },
    "-likesCount": { likesCount: -1 },
};

const toObjectId = (id) => new mongoose.Types.ObjectId(String(id));

export class RatingSellerService {
    /**
     * רשימת דירוגים למוכר עם פגינציה, סינון ומיון
     * @param {Object} args
     * @param {string|ObjectId} args.sellerId
     * @param {number} [args.page=1]
     * @param {number} [args.limit=10]
     * @param {string} [args.sort="-createdAt"]
     * @param {number} [args.stars]
     * @param {boolean} [args.hasComment]
     * @param {boolean} [args.hasMedia]
     * @param {string|ObjectId} [args.productId]
     * @param {string|Date} [args.from]
     * @param {string|Date} [args.to]
     * @param {"approved"|"rejected"|"all"} [args.status="all"]  // ← חדש
     */
    static async listSellerRatings({
        sellerId,
        page = 1,
        limit = 10,
        sort = "-createdAt",
        stars,
        hasComment,
        hasMedia,
        productId,
        from,
        to,
        status = "all", // ← ברירת מחדל: הכל
    }) {
        const q = { sellerId: toObjectId(sellerId) };

        // סינון סטטוס דינמי
        if (status === "approved") q.status = "approved";
        else if (status === "rejected") q.status = "rejected";
        // "all" → לא מסננים לפי סטטוס

        if (productId) q.productId = toObjectId(productId);
        if (stars) q.stars = Number(stars);
        if (hasComment !== undefined) q.text = hasComment ? { $ne: "" } : "";
        if (hasMedia !== undefined) q.hasMedia = !!hasMedia;

        if (from || to) {
            q.createdAt = {};
            if (from) q.createdAt.$gte = new Date(from);
            if (to) q.createdAt.$lte = new Date(to);
        }

        const sortObj = SORT_MAP[sort] || SORT_MAP["-createdAt"];

        const [items, total] = await Promise.all([
            Rating.find(q)
                .sort(sortObj)
                .skip((page - 1) * limit)
                .limit(limit)
                .select({
                    stars: 1,
                    text: 1,
                    images: 1,
                    videos: 1,
                    hasMedia: 1,
                    createdAt: 1,
                    productId: 1,
                    userId: 1,          // ← נחזיר ואז נסיר אם אנונימי
                    anonymous: 1,       // ← צריך כדי לדעת אם להסתיר
                    status: 1,          // ← שימושי להצגה בצד המוכר
                    likesCount: 1,
                    "sellerReply.text": 1,
                    "sellerReply.visible": 1,
                    "sellerReply.createdAt": 1,
                    "sellerReply.deletedAt": 1,
                })
                .lean(),
            Rating.countDocuments(q),
        ]);

        // הסתרת userId במקרה של אנונימיות
        for (const it of items) {
            if (it?.anonymous) delete it.userId;
        }

        return {
            items,
            page: Number(page),
            limit: Number(limit),
            total,
            totalPages: Math.max(1, Math.ceil(total / limit)),
        };
    }

    // אופציונלי: הוספת סטטוס כפרמטר גם לסטטיסטיקות אם תרצי בהמשך


    // סטטיסטיקות למוכר (ממוצע/פירוק/כמות)
    static async getSellerRatingsStats({ sellerId, productId, from, to }) {
        const match = { sellerId: toId(sellerId) };
        if (productId) match.productId = toId(productId);
        if (from || to) {
            match.createdAt = {};
            if (from) match.createdAt.$gte = new Date(from);
            if (to) match.createdAt.$lte = new Date(to);
        }

        const rows = await Rating.aggregate([
            { $match: match },
            { $group: { _id: "$stars", count: { $sum: 1 }, sum: { $sum: "$stars" } } },
        ]);

        const breakdown = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
        let total = 0, sum = 0;
        for (const r of rows) {
            const s = Number(r._id);
            breakdown[s] = r.count;
            total += r.count;
            sum += r.sum;
        }
        const avg = total ? sum / total : 0;
        return { avg, breakdown, count: total };
    }
}
















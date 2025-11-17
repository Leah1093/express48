// services/rating/reply.service.js
import mongoose from "mongoose";
import { Rating } from "../../models/rating.js";

const toId = (v) => new mongoose.Types.ObjectId(String(v));
const HOURS_24 = 24 * 60 * 60 * 1000;

export class RatingReplyService {
    static async createReply({ ratingId, sellerId, userId, text }) {
        const rating = await Rating.findById(toId(ratingId));
        if (!rating) throw Object.assign(new Error("Rating not found"), { status: 404 });
        if (String(rating.sellerId) !== String(sellerId)) {
            throw Object.assign(new Error("Not allowed for this seller"), { status: 403 });
        }
        if (rating.sellerReply) {
            // פעם אחת בלבד גם אם נמחקה רכה — לא מאפשרים יצירה מחדש
            throw Object.assign(new Error("Seller reply already exists"), { status: 409 });
        }

        rating.sellerReply = {
            text: String(text).trim(),
            visible: true,
            repliedBy: toId(userId),
            sellerId: toId(sellerId),
            editableUntil: new Date(Date.now() + HOURS_24),
            deletedAt: null,
            deletedBy: null,
        };
        rating.updatedBy = toId(userId);

        await rating.save();
        return rating.sellerReply;
    }

    static async updateReply({ ratingId, sellerId, userId, text }) {
        const rating = await Rating.findById(toId(ratingId));
        if (!rating) throw Object.assign(new Error("Rating not found"), { status: 404 });
        if (String(rating.sellerId) !== String(sellerId)) {
            throw Object.assign(new Error("Not allowed for this seller"), { status: 403 });
        }
        if (!rating.sellerReply) {
            throw Object.assign(new Error("No seller reply to update"), { status: 404 });
        }
        if (rating.sellerReply.deletedAt) {
            throw Object.assign(new Error("Seller reply was deleted"), { status: 410 });
        }
        if (Date.now() > new Date(rating.sellerReply.editableUntil).getTime()) {
            throw Object.assign(new Error("Edit window expired"), { status: 423 });
        }

        rating.sellerReply.text = String(text).trim();
        rating.sellerReply.editedBy = toId(userId);
        rating.updatedBy = toId(userId);

        await rating.save();
        return rating.sellerReply;
    }



    static async setVisibility({ ratingId, sellerId, userId, visible }) {
        const rating = await Rating.findById(toId(ratingId));
        if (!rating) throw Object.assign(new Error("Rating not found"), { status: 404 });
        if (String(rating.sellerId) !== String(sellerId)) {
            throw Object.assign(new Error("Not allowed for this seller"), { status: 403 });
        }
        if (!rating.sellerReply) {
            throw Object.assign(new Error("No seller reply"), { status: 404 });
        }
        if (rating.sellerReply.deletedAt) {
            throw Object.assign(new Error("Seller reply was deleted"), { status: 410 });
        }

        rating.sellerReply.visible = !!visible;
        rating.sellerReply.editedBy = toId(userId);
        rating.updatedBy = toId(userId);

        await rating.save();
        return rating.sellerReply;
    }

    /** מחיקה רכה: לא מוחקים תוכן, מסמנים deletedAt + visible=false */
    static async softDeleteReply({ ratingId, sellerId, userId }) {
        const rating = await Rating.findById(toId(ratingId));
        if (!rating) throw Object.assign(new Error("Rating not found"), { status: 404 });
        if (String(rating.sellerId) !== String(sellerId)) {
            throw Object.assign(new Error("Not allowed for this seller"), { status: 403 });
        }
        if (!rating.sellerReply) {
            throw Object.assign(new Error("No seller reply to delete"), { status: 404 });
        }
        if (rating.sellerReply.deletedAt) {
            // כבר מחוק רך – נחזיר את המצב הקיים (אידמפוטנטי)
            return rating.sellerReply;
        }

        rating.sellerReply.visible = false;
        rating.sellerReply.deletedAt = new Date();
        rating.sellerReply.deletedBy = toId(userId);
        rating.updatedBy = toId(userId);

        await rating.save();
        return rating.sellerReply;
    }

    static async restoreReply({ ratingId, sellerId, userId }) {
        const rating = await Rating.findById(toId(ratingId));
        if (!rating) throw Object.assign(new Error("Rating not found"), { status: 404 });
        if (String(rating.sellerId) !== String(sellerId)) {
            throw Object.assign(new Error("Not allowed for this seller"), { status: 403 });
        }
        if (!rating.sellerReply) {
            throw Object.assign(new Error("No seller reply to restore"), { status: 404 });
        }
        if (!rating.sellerReply.deletedAt) {
            // כבר לא מחוקה – אידמפוטנטי
            return rating.sellerReply;
        }

        rating.sellerReply.deletedAt = null;
        rating.sellerReply.deletedBy = null;
        rating.sellerReply.visible = false; // משוחזר כמוסתר
        rating.sellerReply.editedBy = toId(userId);
        rating.updatedBy = toId(userId);

        await rating.save();
        return rating.sellerReply;
    }

}

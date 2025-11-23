import mongoose from "mongoose";
import { Rating } from "../../models/rating.js";
import { RatingLike } from "../../models/RatingLike.js";

const toId = (v) => new mongoose.Types.ObjectId(String(v));

export class RatingHelpfulService {
    static async toggleVote({ userId, ratingId, action }) {
        const session = await mongoose.startSession();
        session.startTransaction();
        try {
            const rating = await Rating.findById(toId(ratingId)).session(session);
            if (!rating) { const e = new Error("Rating not found"); e.status = 404; throw e; }
            if ( rating.status !== "approved") {
                const e = new Error("Rating is not available for voting"); e.status = 409; throw e;
            }
            if (String(rating.userId) === String(userId)) {
                const e = new Error("You cannot vote on your own rating"); e.status = 403; throw e;
            }

            const prev = await RatingLike.findOne({ ratingId: rating._id, userId: toId(userId) }).session(session);
            const prevVal = prev?.value ?? 0; // 0 = אין הצבעה
            let nextVal = 0;

            // 👍 = 1, 👎 = -1
            if (action === "like") {
                nextVal = prevVal === 1 ? 0 : 1;   // אם כבר לייק → מבטל, אחרת לייק
            } else if (action === "dislike") {
                nextVal = prevVal === -1 ? 0 : -1; // אם כבר דיסלייק → מבטל, אחרת דיסלייק
            }

            // חישוב דלתא
            const inc = { likesCount: 0, dislikesCount: 0 };
            if (prevVal === 0 && nextVal === 1) inc.likesCount += 1;
            if (prevVal === 0 && nextVal === -1) inc.dislikesCount += 1;
            if (prevVal === 1 && nextVal === 0) inc.likesCount -= 1;
            if (prevVal === -1 && nextVal === 0) inc.dislikesCount -= 1;
            if (prevVal === 1 && nextVal === -1) { inc.likesCount -= 1; inc.dislikesCount += 1; }
            if (prevVal === -1 && nextVal === 1) { inc.dislikesCount -= 1; inc.likesCount += 1; }

            // עדכון במסד
            if (nextVal === 0) {
                if (prev) await RatingLike.deleteOne({ _id: prev._id }).session(session);
            } else if (prev) {
                await RatingLike.updateOne({ _id: prev._id }, { $set: { value: nextVal } }).session(session);
            } else {
                await RatingLike.create([{ ratingId: rating._id, userId: toId(userId), value: nextVal }], { session });
            }

            // עדכון מונים
            const updated = await Rating.findByIdAndUpdate(
                rating._id,
                { $inc: inc },
                { new: true, session, select: { likesCount: 1, dislikesCount: 1 } }
            );

            await session.commitTransaction(); session.endSession();
            return {
                likesCount: updated.likesCount,
                dislikesCount: updated.dislikesCount,
                userVote: nextVal === 1 ? "like" : nextVal === -1 ? "dislike" : null,
            };
        } catch (err) {
            await session.abortTransaction(); session.endSession();
            throw err;
        }
    }
}

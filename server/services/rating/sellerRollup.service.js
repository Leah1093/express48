// services/rating/seller-rollup.service.js
import { Seller } from "../../models/seller.js";

export class SellerRatingsRollupService {
  static deltas = {
    onCreateApproved: (stars) => ({
      sum: stars,
      count: 1,
      breakdown: { [stars]: 1 },
    }),

    onStarsChangeWithinApproved: (oldStars, newStars) => ({
      sum: newStars - oldStars,
      count: 0,
      breakdown: { [oldStars]: -1, [newStars]: 1 },
    }),

    onDeleteApproved: (stars) => ({
      sum: -stars,
      count: -1,
      breakdown: { [stars]: -1 },
    }),

    onRestoreApproved: (stars) => ({
      sum: stars,
      count: 1,
      breakdown: { [stars]: 1 },
    }),
  };

  static async applyDelta(sellerId, delta, session) {
    if (!delta || typeof delta !== "object") return;

    // בונים מסכת $inc לפי הדלתה
    const inc = {};
    if (typeof delta.sum === "number" && delta.sum !== 0) {
      inc["ratings.sum"] = delta.sum;
    }
    if (typeof delta.count === "number" && delta.count !== 0) {
      inc["ratings.count"] = delta.count;
    }
    if (delta.breakdown && typeof delta.breakdown === "object") {
      for (const [k, v] of Object.entries(delta.breakdown)) {
        if (!v) continue;
        // k הוא מספר הכוכבים 1..5
        inc[`ratings.breakdown.${k}`] = v;
      }
    }

    // אם אין מה לעדכן – לצאת
    if (Object.keys(inc).length === 0) return;

    // 1) מעדכנים את הסכומים/מונה/פירוק
    await Seller.updateOne({ _id: sellerId }, { $inc: inc }, { session });

    // 2) מחשבים avg חדש מתוך הערכים המעודכנים
    //    משתמשים ב־pipeline update כדי לעשות avg = sum / count (או 0 כשאין)
    await Seller.updateOne(
      { _id: sellerId },
      [
        {
          $set: {
            "ratings.avg": {
              $cond: [
                { $gt: ["$ratings.count", 0] },
                { $divide: ["$ratings.sum", "$ratings.count"] },
                0,
              ],
            },
          },
        },
      ],
      { session }
    );
  }
}

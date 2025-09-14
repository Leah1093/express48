// services/rating/product-rollup.service.js
import { Product } from "../../models/product.js";

export class ProductRatingsRollupService {
  static deltas = {
    onCreateApproved: (stars) => ({
      sum: stars,
      count: 1,
      breakdown: { [stars]: 1 }
    }),
    onStarsChangeWithinApproved: (oldStars, newStars) => ({
      sum: newStars - oldStars,
      count: 0,
      breakdown: { [oldStars]: -1, [newStars]: 1 }
    }),
    onDeleteApproved: (stars) => ({
      sum: -stars,
      count: -1,
      breakdown: { [stars]: -1 }
    }),
  };

  static async applyDelta(productId, delta, session) {
    const inc = {
      "ratings.sum": delta.sum,
      "ratings.count": delta.count,
      [`ratings.breakdown.${Object.keys(delta.breakdown)[0]}`]: Object.values(delta.breakdown)[0],
    };
    // אם יש כמה ערכים ב-breakdown → נעשה לולאה
    for (const [k,v] of Object.entries(delta.breakdown)) {
      inc[`ratings.breakdown.${k}`] = v;
    }

    await Product.updateOne({ _id: productId }, { $inc: inc }, { session });
  }
}

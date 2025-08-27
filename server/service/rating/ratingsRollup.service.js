// services/rating/ratingsRollup.service.js
import { Product } from "../../models/product.js";
import { Seller } from "../../models/seller.js";

function buildPipeline(deltaPath, delta) {
  const newSum = { $max: [{ $add: [`$${deltaPath}.sum`, delta.sum || 0] }, 0] };
  const newCount = { $max: [{ $add: [`$${deltaPath}.count`, delta.count || 0] }, 0] };
  const newBreakdown = [1,2,3,4,5].reduce((acc, k) => {
    acc[k] = {
      $max: [
        { $add: [{ $ifNull: [`$${deltaPath}.breakdown.${k}`, 0] }, (delta.breakdown?.[k] || 0)] },
        0
      ]
    };
    return acc;
  }, {});

  return [
    { $set: { [`${deltaPath}.sum`]: newSum, [`${deltaPath}.count`]: newCount, [`${deltaPath}.breakdown`]: newBreakdown } },
    { $set: { [`${deltaPath}.avg`]: { $cond: [{ $gt: [newCount, 0] }, { $divide: [newSum, newCount] }, 0] } } }
  ];
}

export class RatingsRollupService {
  static deltas = {
    onCreateApproved: stars => ({ sum: Number(stars) || 0, count: 1, breakdown: { [Number(stars) || 0]: 1 } }),
    onStarsChangeWithinApproved: (oldStars, newStars) => ({
      sum: (Number(newStars)||0) - (Number(oldStars)||0),
      count: 0,
      breakdown: { [Number(oldStars)||0]: -1, [Number(newStars)||0]: +1 }
    })
  };

  static async applyOnProduct({ productId, delta, session }) {
    const pipeline = buildPipeline("ratings", delta);
    await Product.updateOne({ _id: productId }, pipeline, { session });
  }

  static async applyOnSeller({ sellerId, delta, session }) {
    const pipeline = buildPipeline("ratings", delta);
    await Seller.updateOne({ _id: sellerId }, pipeline, { session });
  }
}

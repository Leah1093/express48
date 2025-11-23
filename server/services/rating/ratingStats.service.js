import mongoose from "mongoose";
import { Rating } from "../../models/rating.js";
import { Product } from "../../models/product.js";
import { Seller } from "../../models/seller.js";
const toId = (v) => new mongoose.Types.ObjectId(String(v));

export class RatingStatsService {
  /** חישוב מחדש למוצר בודד */
  static async recalcForProduct(productId) {
    const pipeline = [
      { $match: { productId: toId(productId)} },
      { $group: {
          _id: "$productId",
          count: { $sum: 1 },
          sum: { $sum: "$stars" },
          breakdown: { $push: "$stars" }
      } }
    ];

    const result = await Rating.aggregate(pipeline);
    if (result.length === 0) {
      await Product.findByIdAndUpdate(productId, {
        $set: { "ratings.sum": 0, "ratings.avg": 0, "ratings.count": 0, "ratings.breakdown": {1:0,2:0,3:0,4:0,5:0} }
      });
      return;
    }

    const row = result[0];
    const breakdown = {1:0,2:0,3:0,4:0,5:0};
    row.breakdown.forEach(s => breakdown[s]++);
    const avg = row.count > 0 ? row.sum / row.count : 0;

    await Product.findByIdAndUpdate(productId, {
      $set: {
        "ratings.sum": row.sum,
        "ratings.avg": avg,
        "ratings.count": row.count,
        "ratings.breakdown": breakdown
      }
    });
  }

  /** חישוב מחדש לכל מוכר */
  static async recalcForSeller(sellerId) {
    const pipeline = [
      { $match: { sellerId: toId(sellerId)} },
      { $group: {
          _id: "$sellerId",
          count: { $sum: 1 },
          sum: { $sum: "$stars" },
          breakdown: { $push: "$stars" }
      } }
    ];

    const result = await Rating.aggregate(pipeline);
    if (result.length === 0) {
      await Seller.findByIdAndUpdate(sellerId, {
        $set: { "ratings.sum": 0, "ratings.avg": 0, "ratings.count": 0, "ratings.breakdown": {1:0,2:0,3:0,4:0,5:0} }
      });
      return;
    }

    const row = result[0];
    const breakdown = {1:0,2:0,3:0,4:0,5:0};
    row.breakdown.forEach(s => breakdown[s]++);
    const avg = row.count > 0 ? row.sum / row.count : 0;

    await Seller.findByIdAndUpdate(sellerId, {
      $set: {
        "ratings.sum": row.sum,
        "ratings.avg": avg,
        "ratings.count": row.count,
        "ratings.breakdown": breakdown
      }
    });
  }
}

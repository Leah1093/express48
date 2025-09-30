// import { Favorite } from "../models/Favorite.js";

// export class FavoritesService {
//   async add(userId, productId) {
//     const filter  = { userId, productId };
//     const update  = { $setOnInsert: { userId, productId, addedAt: new Date() } };
//     const options = { upsert: true, new: true, setDefaultsOnInsert: true };
//     return Favorite.findOneAndUpdate(filter, update, options);
//   }

//   async remove(userId, productId) {
//     const { deletedCount } = await Favorite.deleteOne({ userId, productId });
//     return { ok: true, deleted: deletedCount === 1 };
//   }

//   async list(userId, { limit = 200, skip = 0 } = {}) {
//     return Favorite.find({ userId })
//       .sort({ createdAt: -1 })
//       .limit(limit)
//       .skip(skip)
//       .lean();
//   }

//   async exists(userId, productId) {
//     return Boolean(await Favorite.exists({ userId, productId }));
//   }
// }

// export const favoritesService = new FavoritesService();
import { Favorite } from "../models/favorite.js";
import { favoriteQueries } from "../mongoQueries/favoriteQueries.js";

export class FavoritesService {
  async add(userId, productId) {
    const filter = favoriteQueries.findByUserAndProduct(userId, productId);
    const update = { $setOnInsert: { userId, productId, addedAt: new Date() } };
    const options = { upsert: true, new: true, setDefaultsOnInsert: true };
    return Favorite.findOneAndUpdate(filter, update, options);
  }

  async remove(userId, productId) {
    const filter = favoriteQueries.findByUserAndProduct(userId, productId);
    const { deletedCount } = await Favorite.deleteOne(filter);
    return { ok: true, deleted: deletedCount === 1 };
  }

  async list(userId, { limit = 200, skip = 0 } = {}) {
    const filter = favoriteQueries.findByUserId(userId);
    return Favorite.find(filter)
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip)
      .populate("productId")
      .lean();
  }

  async merge(userId, items = []) {
    if (!items.length) {
      return Favorite.find({ userId })
        .sort({ createdAt: -1 })
        .populate("productId")
        .lean();
    }

    // נבנה פעולות upsert כדי למנוע כפילויות (נתמך ע"י unique index שכבר יש לך)
    const ops = items.map(({ productId, addedAt }) => ({
      updateOne: {
        filter: { userId, productId }, // Mongoose ימיר ל-ObjectId
        update: {
          $setOnInsert: {
            userId,
            productId,
            addedAt: addedAt ? new Date(addedAt) : new Date(),
          },
        },
        upsert: true,
      },
    }));

    await Favorite.bulkWrite(ops, { ordered: false });

    // מחזירים רשימה סופית מאוכלסת
    return Favorite.find({ userId })
      .sort({ createdAt: -1 })
      .populate("productId")
      .lean();
  }

  async exists(userId, productId) {
    const filter = favoriteQueries.existsByUserAndProduct(userId, productId);
    return Boolean(await Favorite.exists(filter));
  }
}

export const favoritesService = new FavoritesService();


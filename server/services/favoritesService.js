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
  async list(userId, { page = 1, limit = 200 } = {}) {
    try {
      const p = Math.max(1, Number(page) || 1);
      const l = Math.min(200, Math.max(1, Number(limit) || 200));
      const skip = (p - 1) * l;

      const filter = favoriteQueries.findByUserId(userId);

      const [favorites, total] = await Promise.all([
        Favorite.find(filter)
          .sort({ createdAt: -1 })
          .limit(l)
          .skip(skip)
          .populate({
            path: "productId",
            select: {
              _id: 1,
              slug: 1,
              title: 1,
              storeId: 1,
              images: 1,
              currency: 1,
              price: 1,       // { amount: number }
              discount: 1,
              description: 1,
              stock: 1,
              inStock: 1,
            },
            populate: {
              path: "storeId",
              select: { slug: 1 },
            },
          })
          .lean(),
        Favorite.countDocuments(filter),
      ]);

      const pages = Math.ceil(total / l) || 1;

      const items = favorites
        .map((fav) => {
          const p = fav.productId;
          if (!p) return null;

          return {
            _id: p._id,
            slug: p.slug,
            title: p.title,
            // לשמור מבנה זהה ל־ProductCardDto
            storeId: p.storeId
              ? { slug: p.storeId.slug }
              : undefined,
            images: Array.isArray(p.images) ? p.images : [],
            currency: p.currency,
            price: p.price, // { amount: number }
            discount: p.discount,
            description: p.description,
            stock: p.stock,
            inStock: p.inStock,
          };
        })
        .filter(Boolean);

      return {
        items,
        meta: {
          page: p,
          pages,
          total,
          limit: l,
        },
      };
    } catch (err) {
      console.error("[FavoriteService.list] error:", err);
      throw err instanceof CustomError
        ? err
        : new CustomError(
          err.message || "Error fetching favorites",
          err.status || 500
        );
    }
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


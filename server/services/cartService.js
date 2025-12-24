import mongoose from "mongoose";
import { Cart } from "../models/cart.js";
import { Product } from "../models/product.js";
import { cartQueries } from "../mongoQueries/cartQueries.js";
import { CustomError } from "../utils/CustomError.js";

const toIdStr = (x) =>
  typeof x === "object" && x?._id ? String(x._id) : String(x);

export class CartService {
  async getCart(userId) {
    const cart = await Cart.findOne(cartQueries.findByUserId(userId)).populate(
      "items.productId"
    );
    return cart || { userId, items: [] };
  }

  /**
   * הוספה לעגלה
   * @param {ObjectId} userId - המשתמש המחובר
   * @param {ObjectId} productId - המוצר
   * @param {ObjectId|null} variationId - וריאציה (אם יש)
   * @param {number} quantity - כמות
   * @param {string|null} affiliateRef - מזהה שהגיע מה-?ref= בקישור (userId של המפיץ)
   */
  async addToCart(
    userId,
    productId,
    variationId = null,
    quantity = 1,
    affiliateRef = null
  ) {
    let cart = await Cart.findOne(cartQueries.findByUserId(userId));

    // 🔹 הכנה ללוגיקת שיווק שותפים
    let affiliateUser = null;
    let affiliateRefRaw = null;

    if (affiliateRef) {
      affiliateRefRaw = String(affiliateRef);

      // אם זה ObjectId תקין, ולא אותו משתמש שקונה – נשמור אותו
      if (mongoose.Types.ObjectId.isValid(affiliateRefRaw)) {
        if (!userId || String(userId) !== affiliateRefRaw) {
          affiliateUser = new mongoose.Types.ObjectId(affiliateRefRaw);
        }
      }
    }

    // --- ✨ טיפול במוצרים עם וריאציה ✨ ---
    if (variationId) {
      const prod = await Product.findById(productId);
      if (!prod) throw new Error("Product not found");

      const variation = prod.variations.id(variationId);
      if (!variation) throw new Error("Variation not found");

      let unitPrice = variation.price?.amount || prod.price.amount;

      // ✨ בניית snapshot לוריאציה
      const snapshot = {
        attributes: variation.attributes,
        images: variation.images,
        image: Array.isArray(variation.images) && variation.images.length > 0 ? variation.images[0] : undefined,
        title: prod.title,
        brand: prod.brand,
        shortDescription: prod.shortDescription || prod.description || "",
        price: unitPrice,
        discount: variation.discount || null,
      };

      if (!cart) {
        cart = new Cart({
          userId,
          items: [
            {
              productId,
              variationId,
              quantity,
              unitPrice,
              snapshot,
              affiliateUser,
              affiliateRefRaw,
            },
          ],
        });
      } else {
        // בודקים אם כבר יש את אותו מוצר + אותה וריאציה
        const existingItem = cart.items.find(
          (item) =>
            item.productId.toString() === productId.toString() &&
            item.variationId?.toString() === variationId.toString()
        );

        if (existingItem) {
          existingItem.quantity += quantity;
          // בכוונה לא משנים affiliateUser כדי לא "לגנוב" קרדיט משיתוף קודם
        } else {
          cart.items.push({
            productId,
            variationId,
            quantity,
            unitPrice,
            snapshot,
            affiliateUser,
            affiliateRefRaw,
          });
        }
      }

      await cart.save();
      return await Cart.findOne({ userId }).populate(
        "items.productId",
        "title price images"
      );
    }

    // --- ✨ זרימה קיימת למוצרים פשוטים ✨ ---
    const prod = await Product.findById(productId).lean();
    if (!prod) throw new Error("Product not found");

    let unitPrice = prod.price.amount;

    // ✨ בניית snapshot גם למוצר פשוט
    const snapshot = {
      attributes: {}, // אין וריאציות
      images: prod.images || [],
      image: Array.isArray(prod.images) && prod.images.length > 0 ? prod.images[0] : undefined,
      title: prod.title,
      brand: prod.brand,
      shortDescription: prod.shortDescription || prod.description || "",
      price: unitPrice,
      discount: prod.discount || null,
    };

    if (!cart) {
      cart = new Cart({
        userId,
        items: [
          {
            productId,
            quantity,
            unitPrice,
            snapshot,
            affiliateUser,
            affiliateRefRaw,
          },
        ],
      });
    } else {
      const existingItem = cart.items.find(
        (item) => item.productId.toString() === productId.toString()
      );
      if (existingItem) {
        existingItem.quantity += quantity;
        // גם כאן – שומרים את ה-affiliate המקורי אם היה
      } else {
        cart.items.push({
          productId,
          quantity,
          unitPrice,
          snapshot,
          affiliateUser,
          affiliateRefRaw,
        });
      }
    }

    await cart.save();
    return await Cart.findOne({ userId }).populate(
      "items.productId",
      "title price images"
    );
  }

  async removeFromCart(userId, productId) {
    // שליפת העגלה של המשתמש
    const cart = await Cart.findOne(cartQueries.findByUserId(userId));
    if (!cart) {
      throw new CustomError("Cart not found", 404);
    }
    // מציאת המוצר בעגלה לפי productId
    const item = cart.items.find(
      (item) => item.productId.toString() === productId
    );
    // אם לא נמצא פריט מתאים - נחזיר את העגלה כמו שהיא
    if (!item) {
      return cart;
    }
    if (item.quantity > 1) {
      // אם יש יותר מאחד - נוריד באחד
      item.quantity -= 1;
    } else {
      // אם יש רק אחד - נסיר את הפריט מהעגלה
      cart.items = cart.items.filter(
        (item) => item.productId.toString() !== productId
      );
    }
    // שמירה של השינויים בעגלה
    await cart.save();
    return cart;
  }

  async removeProductCompletely(userId, productId, variationId = null) {
    // שליפת העגלה של המשתמש
    const cart = await Cart.findOne(cartQueries.findByUserId(userId));
    if (!cart) {
      throw new CustomError("Cart not found", 404);
    }

    // סינון כל הפריטים שאינם המוצר הרצוי (כלומר - הסרה מוחלטת)
    cart.items = cart.items.filter(
      (item) =>
        !(
          item.productId.toString() === productId.toString() &&
          (item.variationId?.toString() || null) ===
            (variationId?.toString() || null)
        )
    );

    // שמירה של השינויים בעגלה
    await cart.save();
    return await Cart.findOne({ userId }).populate(
      "items.productId",
      "title price images"
    );
  }

  async clearCart(userId) {
    const cart = await Cart.findOne(cartQueries.findByUserId(userId));
    if (cart) {
      cart.items = [];
      await cart.save();
    }
    return cart;
  }

  async mergeLocalCart(userId, localItems = []) {
    let cart = await Cart.findOne(cartQueries.findByUserId(userId));

    // נרמול קלט
    const normalized = (Array.isArray(localItems) ? localItems : [])
      .map((it) => ({
        productId: toIdStr(it.productId),
        quantity: Number(it.quantity ?? 1),
        selected: Boolean(it.selected),
      }))
      .filter((it) => it.productId && it.quantity > 0);

    // באצ' מחירים מראש (יעיל ומהיר)
    const ids = [...new Set(normalized.map((it) => it.productId))];
    const prods = await Product.find({ _id: { $in: ids } })
      .select("price")
      .lean();
    const priceMap = Object.fromEntries(
      prods.map((p) => [String(p._id), Number(p.price.amount)])
    );

    if (!cart) {
      // ✅ עגלה חדשה: לבנות items עם unitPrice, לשמור ולהחזיר
      const itemsWithPrice = normalized.map((it) => {
        const price = priceMap[it.productId];
        if (price == null)
          throw new Error(`Product not found: ${it.productId}`);
        return {
          productId: it.productId,
          quantity: it.quantity,
          unitPrice: price,
          selected: it.selected ?? false,
        };
      });

      cart = new Cart({ userId, items: itemsWithPrice });
      await cart.save();
      return await Cart.findOne({ userId }).populate(
        "items.productId",
        "title price images"
      );
    }

    // ✅ עגלה קיימת: מיזוג פריטים + השלמת unitPrice כשצריך
    for (const it of normalized) {
      const existing = cart.items.find(
        (row) => String(row.productId) === it.productId
      );
      if (existing) {
        if (existing.unitPrice == null) {
          const price = priceMap[it.productId];
          if (price == null)
            throw new Error(`Product not found: ${it.productId}`);
          existing.unitPrice = price;
        }
        existing.quantity += it.quantity;
        // עדכון מצב בחירה (שומר TRUE אם אחד מהם נבחר)
        if (it.selected) existing.selected = true;
      } else {
        const price = priceMap[it.productId];
        if (price == null)
          throw new Error(`Product not found: ${it.productId}`);
        cart.items.push({
          productId: it.productId,
          quantity: it.quantity,
          unitPrice: price,
          selected: it.selected ?? false,
        });
      }
    }

    await cart.save();
    return await Cart.findOne({ userId }).populate(
      "items.productId",
      "title price images"
    );
  }

  async updateItemQuantity(userId, productId, variationId = null, quantity) {
    const cart = await Cart.findOne(cartQueries.findByUserId(userId));
    if (!cart) {
      throw new CustomError("Cart not found", 404);
    }
    // מציאת פריט לפי productId + variationId (אם יש)
    const item = cart.items.find(
      (i) =>
        i.productId.toString() === productId.toString() &&
        (i.variationId?.toString() || null) ===
          (variationId?.toString() || null)
    );
    if (!item) {
      throw new CustomError("Product not found in cart", 404);
    }
    item.quantity = quantity; // ⬅️ עדכון הכמות
    await cart.save();

    return await Cart.findOne({ userId }).populate(
      "items.productId",
      "title price images"
    );
  }

  async toggleItemSelected(userId, itemId, selected) {
    console.log("👉 מה התקבל:", itemId, selected);

    const cart = await Cart.findOneAndUpdate(
      { userId: userId, "items._id": itemId },
      { $set: { "items.$.selected": selected } },
      { new: true }
    ).populate("items.productId");
    if (!cart) {
      throw new Error("Cart not found or item not found");
    } else {
      console.log("cart", cart);
    }

    return cart;
  }

  async toggleSelectAll(userId, selected) {
    const cart = await Cart.findOneAndUpdate(
      { userId },
      { $set: { "items.$[].selected": selected } }, // מעדכן את כולם בבת אחת
      { new: true }
    ).populate("items.productId");

    return cart;
  }
}

import { Cart } from '../models/cart.js';
import { Product } from "../models/Product.js"; // ודאי את הנתיב הנכון
import { cartQueries } from '../mongoQueries/cartQueries.js';
import { CustomError } from '../utils/CustomError.js';

const toIdStr = (x) => (typeof x === 'object' && x?._id ? String(x._id) : String(x));
function isDiscountActive(discount) {
  if (!discount) return false;

  const now = new Date();

  if (discount.startsAt) {
    const starts = new Date(discount.startsAt);
    if (starts > now) return false;
  }

  if (discount.expiresAt) {
    const expires = new Date(discount.expiresAt);
    if (expires < now) return false;
  }

  return true;
}

function getCurrentPriceFromProduct(product) {
  if (!product) return 0;

  const base =
    typeof product.price?.amount === "number"
      ? product.price.amount
      : 0;

  // אם אין מחיר בסיסי – אין מה לעשות
  if (base <= 0) return 0;

  const discount = product.discount;
  if (!discount || !isDiscountActive(discount)) {
    return base;
  }

  // ניקוי טיפשי של פסיק בסוג (כמו "fixed,")
  const rawType = String(discount.discountType || "").toLowerCase().trim();
  const type = rawType.replace(/,+$/, ""); // מוריד פסיקים בסוף

  const value =
    typeof discount.discountValue === "number"
      ? discount.discountValue
      : Number(discount.discountValue) || 0;

  if (value <= 0) {
    return base;
  }

  let finalPrice = base;

  if (type === "percent") {
    // value = אחוז הנחה
    finalPrice = base * (1 - value / 100);
  } else if (type === "fixed") {
    // value = מחיר סופי קבוע (למשל 650)
    finalPrice = base - value;
  } else {
    // אם הסוג לא מוכר – נשמור על המחיר הרגיל
    finalPrice = base;
  }

  if (finalPrice < 0) finalPrice = 0;

  return Number(finalPrice.toFixed(2));
}

function mapCartToResponse(cartDoc) {
  if (!cartDoc || !cartDoc.items || cartDoc.items.length === 0) {
    const now = new Date().toISOString();
    return {
      ok: true,
      items: [],
      meta: {
        totalQuantity: 0,
        subtotal: 0,
        selectedSubtotal: 0,
        updatedAt: now,
      },
      issues: [],
    };
  }

  const issues = [];

  const items = cartDoc.items.map((item) => {
    const product = item.productId || {};

    const currentPrice = getCurrentPriceFromProduct(product);

    // אם אין unitPrice (עגלה ישנה) – נניח שהיה כמו הנוכחי
    const previousPrice =
      typeof item.unitPrice === "number" ? item.unitPrice : currentPrice;

    if (currentPrice !== previousPrice) {
      issues.push({
        type: "PRICE_CHANGED",
        productId:
          product._id?.toString?.() ||
          item.productId?.toString?.() ||
          "",
        message: "המחיר של מוצר זה עודכן מאז שהוספת אותו לעגלה.",
      });
    }

    // 🔹 חישוב כמות במלאי מהמוצר
    const stock =
      typeof product.stock === "number" ? product.stock : undefined;

    // 🔹 האם המוצר אזל מהמלאי
    const isOutOfStock = typeof stock === "number" && stock <= 0;

    const snapshot = {
      title: product.title || "",
      image:
        Array.isArray(product.images) && product.images.length > 0
          ? product.images[0]
          : product.image ||
            (Array.isArray(product.overview?.images) &&
            product.overview.images.length > 0
              ? product.overview.images[0]
              : undefined),
      brand: product.brand || undefined,
      shortDescription:
        product.description || product.overview?.text || undefined,
      // כאן inStock זה כמות במלאי, כמו שהיה אצלך
      inStock: stock,
      priceNow: currentPrice,
    };

    // 🔹 ברירת מחדל לבחירה (אם היה שדה selected בעגלה)
    const baseSelected = item.selected ?? true;

    // 🔹 אם אין מלאי → לא נחשב כבחור
    const selected = isOutOfStock ? false : baseSelected;

    // (אופציונלי) אפשר גם להוסיף issue מיוחד על חוסר מלאי
    if (isOutOfStock) {
      issues.push({
        type: "OUT_OF_STOCK",
        productId:
          product._id?.toString?.() ||
          item.productId?.toString?.() ||
          "",
        message: "המוצר אינו במלאי ולכן לא נבחר לתשלום.",
      });
    }

    return {
      id: item._id.toString(),
      productId:
        product._id?.toString?.() ||
        item.productId?.toString?.() ||
        "",
      quantity: item.quantity,
      unitPrice: previousPrice,
      selected,
      snapshot,
    };
  });

  const totalQuantity = items.reduce((sum, it) => sum + it.quantity, 0);

  const subtotal = items.reduce(
    (sum, it) =>
      sum + (it.snapshot.priceNow ?? it.unitPrice) * it.quantity,
    0
  );

  // כאן כבר משתמשים ב־selected אחרי שביטלנו אותם למוצרים בלי מלאי
  const selectedSubtotal = items
    .filter((it) => it.selected)
    .reduce(
      (sum, it) =>
        sum + (it.snapshot.priceNow ?? it.unitPrice) * it.quantity,
      0
    );

  const meta = {
    totalQuantity,
    subtotal,
    selectedSubtotal,
    updatedAt: new Date().toISOString(),
  };

  return {
    ok: true,
    items,
    meta,
    issues,
  };
}


export class CartService {
  async getCart(userId) {
    console.log("✅✅✅")
    const cart = await Cart.findOne(cartQueries.findByUserId(userId))
      .populate("items.productId")
      .exec();

    // במקום להחזיר את המסמך כמו שהוא – ממפים ל-CartResponse
    return mapCartToResponse(cart);
  }


async addToCart(userId, productId, quantity = 1) {
  // 1) משיג את המוצר
  const product = await Product.findById(productId).lean();
  if (!product) {
    throw new CustomError("המוצר לא נמצא", 404);
  }

  // 2) מחיר בזמן הוספה לסל (אחרי מבצע, לפי getCurrentPriceFromProduct)
  const currentPrice = getCurrentPriceFromProduct(product);
  const unitPrice = currentPrice; // זה מה שנשמר בעגלה

  // 3) שליפת העגלה
  let cart = await Cart.findOne({ userId });

  // 4) אם אין עגלה → ליצור חדשה
  if (!cart) {
    cart = new Cart({
      userId,
      items: [
        {
          productId,
          quantity,
          unitPrice,   // המחיר בזמן ההוספה, אחרי כל ההנחות
          selected: true,
        },
      ],
    });

    await cart.save();

    const populated = await Cart.findOne({ userId }).populate("items.productId");
    return mapCartToResponse(populated);
  }

  // 5) אם יש עגלה – בודקים אם המוצר כבר בפנים
  const existing = cart.items.find(
    (it) => it.productId.toString() === productId.toString()
  );

  if (existing) {
    // אם את רוצה שהמחיר הטמון בעגלה יתעדכן כשמוסיפים שוב
    // אפשר לעדכן גם את unitPrice כאן:
    existing.quantity = quantity;
    existing.unitPrice = unitPrice; // אופציונלי, אבל מומלץ כדי לשקף מחיר עדכני בעת שינוי כמות
  } else {
    cart.items.push({
      productId,
      quantity,
      unitPrice,
      selected: true,
    });
  }

  // 6) שמירה
  await cart.save();

  // 7) populate למוצר + עיבוד ל CartResponse
  const updated = await Cart.findOne({ userId }).populate("items.productId");
  return mapCartToResponse(updated);
}



  async removeFromCart(userId, productId) {
    // 1) שליפת העגלה
    const cart = await Cart.findOne(cartQueries.findByUserId(userId));
    if (!cart) {
      throw new CustomError("Cart not found", 404);
    }

    const productIdStr = productId.toString();

    // 2) מציאת הפריט לפי productId
    const item = cart.items.find(
      (it) => it.productId.toString() === productIdStr
    );

    // 3) אם לא קיים כזה פריט – מחזירים את העגלה כמו שהיא, אבל כבר כ-CartResponse
    if (!item) {
      const populated = await cart.populate("items.productId");
      return mapCartToResponse(populated);
    }

    // 4) אם יש יותר מאחד – מורידים כמות
    if (item.quantity > 1) {
      item.quantity -= 1;
    } else {
      // 5) אם הכמות 1 – מסירים את הפריט לגמרי
      cart.items = cart.items.filter(
        (it) => it.productId.toString() !== productIdStr
      );
    }

    // 6) שמירה
    await cart.save();

    // 7) שליפה מחדש עם populate + מיפוי ל-CartResponse
    const updated = await Cart.findOne(cartQueries.findByUserId(userId))
      .populate("items.productId");

    return mapCartToResponse(updated);
  }


  async removeProductCompletely(userId, productId) {
    // 1) שליפת העגלה של המשתמש
    const cart = await Cart.findOne(cartQueries.findByUserId(userId));
    if (!cart) {
      throw new CustomError("Cart not found", 404);
    }

    const productIdStr = productId.toString();

    // 2) מחיקת כל הפריטים של אותו productId (הסרה מוחלטת מהעגלה)
    cart.items = cart.items.filter(
      (item) => item.productId.toString() !== productIdStr
    );

    // 3) שמירה של השינויים
    await cart.save();

    // 4) שליפה מחדש עם populate + החזרה כ-CartResponse
    const updated = await Cart.findOne(cartQueries.findByUserId(userId))
      .populate("items.productId");

    return mapCartToResponse(updated);
  }






  async clearCart(userId) {
    // 1) שליפת העגלה
    let cart = await Cart.findOne(cartQueries.findByUserId(userId));

    // 2) אם אין עגלה בכלל – נחזיר תגובה ריקה תקינה
    if (!cart) {
      return mapCartToResponse(null);
    }

    // 3) ניקוי כל הפריטים
    cart.items = [];
    await cart.save();

    // 4) שליפה מחדש עם populate (אין פריטים, אבל זה לשמירת אחידות)
    const updated = await Cart.findOne(cartQueries.findByUserId(userId))
      .populate("items.productId");

    // 5) המרה ל-CartResponse
    return mapCartToResponse(updated);
  }


  async mergeLocalCart(userId, localItems = []) {
    let cart = await Cart.findOne(cartQueries.findByUserId(userId));

    // 🔹 נרמול קלט מהפרונט (localStorage)
    const normalized = (Array.isArray(localItems) ? localItems : [])
      .map((it) => ({
        productId: toIdStr(it.productId),
        quantity: Number(it.quantity ?? 1),
        selected: it.selected === undefined ? true : Boolean(it.selected),
      }))
      .filter((it) => it.productId && it.quantity > 0);

    // אם אין בכלל מה למזג – מחזירים את העגלה כפי שהיא
    if (normalized.length === 0) {
      if (!cart) {
        // אין עגלה בכלל
        return mapCartToResponse(null);
      }
      const populated = await cart.populate("items.productId");
      return mapCartToResponse(populated);
    }

    // 🔹 באצ' מחירים מהמוצרים (יעיל)
    const ids = [...new Set(normalized.map((it) => it.productId))];
    const prods = await Product.find({ _id: { $in: ids } })
      .select("price")
      .lean();

    const priceMap = Object.fromEntries(
      prods.map((p) => [String(p._id), Number(p.price?.amount ?? 0)])
    );

    // 🆕 אם אין עגלה – יוצרים אחת חדשה
    if (!cart) {
      const itemsWithPrice = normalized.map((it) => {
        const price = priceMap[it.productId];
        if (price == null || Number.isNaN(price)) {
          throw new Error(`Product not found or invalid price: ${it.productId}`);
          // או CustomError אם תרצי
        }
        return {
          productId: it.productId,
          quantity: it.quantity,
          unitPrice: price,
          selected: it.selected ?? true,
        };
      });

      cart = new Cart({ userId, items: itemsWithPrice });
      await cart.save();

      const populated = await Cart.findOne(cartQueries.findByUserId(userId))
        .populate("items.productId");
      return mapCartToResponse(populated);
    }

    // 🧩 מיזוג לעגלה קיימת
    for (const it of normalized) {
      const existing = cart.items.find(
        (row) => String(row.productId) === it.productId
      );

      const price = priceMap[it.productId];
      if (price == null || Number.isNaN(price)) {
        throw new Error(`Product not found or invalid price: ${it.productId}`);
      }

      if (existing) {
        // אם אין unitPrice ישן – נשלים למחיר הנוכחי
        if (typeof existing.unitPrice !== "number") {
          existing.unitPrice = price;
        }
        // מגדילים כמות
        existing.quantity += it.quantity;

        // אם בלוקאל זה מסומן → נסמן גם בעגלה
        if (it.selected) {
          existing.selected = true;
        }
      } else {
        // מוצר חדש לגמרי לעגלה
        cart.items.push({
          productId: it.productId,
          quantity: it.quantity,
          unitPrice: price,
          selected: it.selected ?? true,
        });
      }
    }

    await cart.save();

    const updated = await Cart.findOne(cartQueries.findByUserId(userId))
      .populate("items.productId");

    return mapCartToResponse(updated);
  }





  async updateItemQuantity(userId, productId, quantity) {
    // נוודא שכמות היא מספר תקין
    const q = Number(quantity);
    if (!Number.isFinite(q)) {
      throw new CustomError("Invalid quantity", 400);
    }

    const cart = await Cart.findOne(cartQueries.findByUserId(userId));
    if (!cart) {
      throw new CustomError("Cart not found", 404);
    }

    const productIdStr = productId.toString();

    // מוצאים את הפריט בעגלה לפי productId בלבד (בלי וריאציות)
    const item = cart.items.find(
      (i) => i.productId.toString() === productIdStr
    );

    if (!item) {
      throw new CustomError("Product not found in cart", 404);
    }

    // אם הכמות 0 או פחות – נסיר את הפריט מהעגלה
    if (q <= 0) {
      cart.items = cart.items.filter(
        (i) => i.productId.toString() !== productIdStr
      );
    } else {
      // אחרת – נעדכן כמות
      item.quantity = q;
    }

    await cart.save();

    const updated = await Cart.findOne(cartQueries.findByUserId(userId))
      .populate("items.productId");

    return mapCartToResponse(updated);
  }


  async toggleItemSelected(userId, itemId, selected) {
    const isSelected = Boolean(selected);

    // מעדכן את הפריט הספציפי לפי ה-_id של ה-item (CartItem.id בצד לקוח)
    const cart = await Cart.findOneAndUpdate(
      { ...cartQueries.findByUserId(userId), "items._id": itemId },
      { $set: { "items.$.selected": isSelected } },
      { new: true }
    ).populate("items.productId");

    if (!cart) {
      throw new CustomError("Cart not found or item not found", 404);
    }

    return mapCartToResponse(cart);
  }

  async toggleSelectAll(userId, selected) {
    const isSelected = Boolean(selected);

    let cart = await Cart.findOne(cartQueries.findByUserId(userId));

    // אם אין עגלה – נחזיר תגובה ריקה תקינה
    if (!cart) {
      return mapCartToResponse(null);
    }

    // מעדכן את כל הפריטים בבת אחת
    cart.items.forEach((item) => {
      item.selected = isSelected;
    });

    await cart.save();

    const updated = await Cart.findOne(cartQueries.findByUserId(userId))
      .populate("items.productId");

    return mapCartToResponse(updated);
  }

}


  // async toggleItemSelected(userId, itemId, selected) {
  //   console.log("👉 מה התקבל:", itemId, selected);

  //   const cart = await Cart.findOneAndUpdate(
  //     { userId: userId, "items._id": itemId },
  //     { $set: { "items.$.selected": selected } },
  //     { new: true }
  //   ).populate("items.productId");
  //   if (!cart) {
  //     throw new Error("Cart not found or item not found");
  //   } else {
  //     console.log("cart", cart);
  //   }


  //   return cart;
  // }


  // async toggleSelectAll(userId, selected) {
  //   const cart = await Cart.findOneAndUpdate(
  //     { userId },
  //     { $set: { "items.$[].selected": selected } }, // מעדכן את כולם בבת אחת
  //     { new: true }
  //   ).populate("items.productId");

  //   return cart;
  // }

  // async updateItemQuantity(userId, productId, variationId = null, quantity) {
  //   const cart = await Cart.findOne(cartQueries.findByUserId(userId));
  //   if (!cart) {
  //     throw new CustomError("Cart not found", 404);
  //   }
  //   // מציאת פריט לפי productId + variationId (אם יש)
  //   const item = cart.items.find(
  //     (i) =>
  //       i.productId.toString() === productId.toString() &&
  //       (i.variationId?.toString() || null) === (variationId?.toString() || null)
  //   );
  //   if (!item) {
  //     throw new CustomError("Product not found in cart", 404);
  //   }
  //   item.quantity = quantity; // ⬅️ עדכון הכמות
  //   await cart.save();

  //   return await Cart.findOne({ userId }).populate(
  //     "items.productId",
  //     "title price images"
  //   );
  // }

  // async addToCart(userId, productId, variationId = null, quantity = 1) {
  //   let cart = await Cart.findOne(cartQueries.findByUserId(userId));

  //   // --- ✨ טיפול במוצרים עם וריאציה ✨ ---
  //   if (variationId) {
  //     const prod = await Product.findById(productId);
  //     if (!prod) throw new Error('Product not found');

  //     const variation = prod.variations.id(variationId);
  //     if (!variation) throw new Error('Variation not found');

  //     let unitPrice = variation.price?.amount || prod.price.amount;

  //     // ✨ בניית snapshot לוריאציה
  //     const snapshot = {
  //       attributes: variation.attributes,
  //       images: variation.images,
  //       price: unitPrice,
  //       discount: variation.discount || null,
  //     };

  //     if (!cart) {
  //       cart = new Cart({
  //         userId,
  //         items: [{ productId, variationId, quantity, unitPrice, snapshot }]
  //       });
  //     } else {
  //       // בודקים אם כבר יש את אותו מוצר + אותה וריאציה
  //       const existingItem = cart.items.find(
  //         item =>
  //           item.productId.toString() === productId.toString() &&
  //           item.variationId?.toString() === variationId.toString()
  //       );

  //       if (existingItem) {
  //         existingItem.quantity += quantity;
  //       } else {
  //         cart.items.push({ productId, variationId, quantity, unitPrice, snapshot });
  //       }
  //     }

  //     await cart.save();
  //     return await Cart.findOne({ userId })
  //       .populate("items.productId", "title price images");
  //   }

  //   // --- ✨ זרימה קיימת למוצרים פשוטים ✨ ---
  //   const prod = await Product.findById(productId).lean();
  //   if (!prod) throw new Error('Product not found');

  //   let unitPrice = prod.price.amount;

  //   // ✨ בניית snapshot גם למוצר פשוט
  //   const snapshot = {
  //     attributes: {}, // אין וריאציות
  //     images: prod.images || [],
  //     price: unitPrice,
  //     discount: prod.discount || null,
  //   };

  //   if (!cart) {
  //     cart = new Cart({
  //       userId,
  //       items: [{ productId, quantity, unitPrice, snapshot }]
  //     });
  //   } else {
  //     const existingItem = cart.items.find(item => item.productId.toString() === productId.toString());
  //     if (existingItem) {
  //       existingItem.quantity += quantity;
  //     } else {
  //       cart.items.push({ productId, quantity, unitPrice, snapshot });
  //     }
  //   }

  //   await cart.save();
  //   return await Cart.findOne({ userId })
  //     .populate("items.productId", "title price images");
  // }
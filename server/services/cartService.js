import mongoose from "mongoose";
import { Cart } from "../models/cart.js";
import { Product } from "../models/product.js";
import { cartQueries } from "../mongoQueries/cartQueries.js";
import { CustomError } from "../utils/CustomError.js";

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

function getCurrentPriceFromProduct(product, variationId = null) {
  if (!product) return 0;

  let base = 0;

  // 1) אם הגיע variationId – ננסה לקחת מחיר מהווריאציה
  if (
    variationId &&
    Array.isArray(product.variations) &&
    product.variations.length > 0
  ) {
    const v = product.variations.find((vv) =>
      vv._id?.toString?.() === variationId.toString()
    );

    if (v) {
      if (typeof v._calculatedPrice === "number") {
        base = v._calculatedPrice;
      } else if (typeof v.price?.amount === "number") {
        base = v.price.amount;
      }
    }
  }

  // 2) fallback למחיר מוצר רגיל
  if (base <= 0) {
    base = typeof product.price?.amount === "number"
      ? product.price.amount
      : 0;
  }
  // אם עדיין אין מחיר – חוזרים 0
  if (base <= 0) return 0;

  const discount = product.discount;
  if (!discount || !isDiscountActive(discount)) {
    return Number(base.toFixed(2));
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
    const variationId = item.variationId || null;
    const variationConfig = product.variationsConfig;
    const currentPrice = getCurrentPriceFromProduct(product, variationId);

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
    let stock =
    
    typeof product.stock === "number" ? product.stock : undefined;

  // 🔹 נתחיל מתמונה כללית של מוצר
  let image =
    Array.isArray(product.images) && product.images.length > 0
      ? product.images[0]
      : product.image ||
        (Array.isArray(product.overview?.images) &&
        product.overview.images.length > 0
          ? product.overview.images[0]
          : undefined);

  // ⭐ פה נכניס לוגיקה לפי וריאציה (אם יש)
  let variationAttributes;

  if (variationId && Array.isArray(product.variations)) {
    const v = product.variations.find(
      (vv) => vv._id?.toString?.() === variationId.toString()
    );

    if (v) {
      // אם יש סטוק ספציפי לווריאציה
      if (typeof v.stock === "number") {
        stock = v.stock;
      }

      // אם יש תמונות לווריאציה – נשתמש בהן
      if (Array.isArray(v.images) && v.images.length > 0) {
        image = v.images[0];
      }

      if (
      v.attributes &&
      typeof v.attributes === "object" &&
      variationConfig &&
      Array.isArray(variationConfig.attributes)
    ) {
      const attrs = {};

      Object.entries(v.attributes).forEach(([attrName, rawValue]) => {
        // מחפשים את ההגדרה עבור ה-attr הזה
        const cfgAttr = variationConfig.attributes.find(
          (a) => a.name === attrName
        );

        // מה יוצג כלייבל (גודל / צבע)
        const label = cfgAttr?.displayName || attrName;

        // מה יוצג כערך (XL / שחור)
        let displayValue = rawValue;

        if (cfgAttr && Array.isArray(cfgAttr.terms)) {
          const term = cfgAttr.terms.find((t) => t.label === rawValue);
          if (term) {
            displayValue = term.label;
          }
        }

        attrs[label] = displayValue;
      });

      variationAttributes = attrs; // לדוגמה: { "גודל": "XL", "צבע": "שחור" }
    }
      
    }
  }

    // 🔹 האם המוצר אזל מהמלאי
    const isOutOfStock = typeof stock === "number" && stock <= 0;

    const snapshot = {
      title: product.title || "",
      image,
      brand: product.brand || undefined,
      shortDescription:
        product.description || product.overview?.text || undefined,
      // כאן inStock זה כמות במלאי, כמו שהיה אצלך
      inStock: stock,
      priceNow: currentPrice,
      variationAttributes,
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

    // אם הכמות בעגלה גדולה מהמלאי - נוסיף issue
    if (typeof stock === "number" && stock >= 0 && item.quantity > stock) {
      issues.push({
        type: "QUANTITY_ADJUSTED",
        productId:
          product._id?.toString?.() ||
          item.productId?.toString?.() ||
          "",
        message: `הכמות בעגלה עודכנה ל-${stock} יחידות (המלאי הזמין).`,
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
      variationId: item.variationId || null,
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
  /**
   * מעדכן כמות בעגלה לפי מלאי זמין
   * אם הכמות בעגלה גדולה מהמלאי - מעדכן למלאי המקסימלי
   */
  async syncCartQuantityWithStock(cart) {
    if (!cart || !cart.items || cart.items.length === 0) {
      return false; // אין מה לעדכן
    }

    let wasUpdated = false;

    for (const item of cart.items) {
      if (!item.productId) continue;

      // שליפת המוצר העדכני
      const product = await Product.findById(item.productId);
      if (!product) continue;

      // חישוב מלאי זמין
      let availableStock = typeof product.stock === "number" ? product.stock : 0;

      // אם יש וריאציה - נשתמש במלאי שלה
      if (item.variationId && Array.isArray(product.variations)) {
        const variationIdStr = String(item.variationId);
        const variation = product.variations.find(
          (v) => String(v._id) === variationIdStr
        );
        if (variation && typeof variation.stock === "number") {
          availableStock = variation.stock;
        }
      }

      // אם הכמות בעגלה גדולה מהמלאי - נעדכן
      if (item.quantity > availableStock && availableStock >= 0) {
        item.quantity = Math.max(0, availableStock);
        wasUpdated = true;
      }
    }

    // אם היה עדכון - נשמור
    if (wasUpdated) {
      await cart.save();
    }

    return wasUpdated;
  }

  async getCart(userId) {
    // שליפת העגלה (לא lean כדי שנוכל לעדכן)
    const cart = await Cart.findOne(cartQueries.findByUserId(userId))
      .populate("items.productId");

    if (!cart) {
      return mapCartToResponse(null);
    }

    // עדכון כמות לפי מלאי זמין
    await this.syncCartQuantityWithStock(cart);

    // המרה ל-lean אחרי העדכון
    const cartLean = cart.toObject();
    
    // במקום להחזיר את המסמך כמו שהוא – ממפים ל-CartResponse
    return mapCartToResponse(cartLean);
  }


async addToCart(userId, productId, quantity = 1, variationId = null) {
  // 1) משיג את המוצר
  const product = await Product.findById(productId).lean();
  if (!product) {
    throw new CustomError("המוצר לא נמצא", 404);
  }

  // 2) מחיר בזמן הוספה לסל (אחרי מבצע, לפי getCurrentPriceFromProduct)
  const currentPrice = getCurrentPriceFromProduct(product, variationId);
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
          variationId: variationId || null,
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
    (it) => it.productId.toString() === productId.toString()&&
      (it.variationId || null) === (variationId || null)
  );

  if (existing) {
    // אם את רוצה שהמחיר הטמון בעגלה יתעדכן כשמוסיפים שוב
    // אפשר לעדכן גם את unitPrice כאן:
    existing.quantity = quantity;
    existing.unitPrice = unitPrice; // אופציונלי, אבל מומלץ כדי לשקף מחיר עדכני בעת שינוי כמות
  } else {
    cart.items.push({
      productId,
      variationId: variationId || null,
      quantity,
      unitPrice,
      selected: true,
    });
  }

  // 6) שמירה
  await cart.save();

  // 7) populate למוצר + עיבוד ל CartResponse
  const updated = await Cart.findOne({ userId }).populate("items.productId").lean();
  return mapCartToResponse(updated);
}



  async removeFromCart(userId, productId, variationId = null) {
    // 1) שליפת העגלה
    const cart = await Cart.findOne(cartQueries.findByUserId(userId));
    if (!cart) {
      throw new CustomError("Cart not found", 404);
    }

    const productIdStr = productId.toString();

    // 2) מציאת הפריט לפי productId
    cart.items = cart.items.filter(
      (it) =>
        !(
          it.productId.toString() === productIdStr &&
          String(it.variationId || "") === String(variationId || "")
        )
    );

    // 3) אם לא קיים כזה פריט – מחזירים את העגלה כמו שהיא, אבל כבר כ-CartResponse
    if (!item) {
      const populated = await cart.populate("items.productId");
      return mapCartToResponse(populated).lean();
    }

    // 4) אם יש יותר מאחד – מורידים כמות
    if (item.quantity > 1) {
      item.quantity -= 1;
    } else {
      // 5) אם הכמות 1 – מסירים את הפריט לגמרי
      cart.items = cart.items.filter(
        (it) =>
          !(
            it.productId.toString() === productIdStr &&
            String(it.variationId || "") === String(variationId || "")
          )
      );
    }

    // 6) שמירה
    await cart.save();

    // 7) שליפה מחדש עם populate + מיפוי ל-CartResponse
     const updated = await Cart.findOne(
          cartQueries.findByUserId(userId)
        ).populate("items.productId");
    
    return mapCartToResponse(updated);
  }


  async removeProductCompletely(userId, productId, variationId = null) {
    // 1) שליפת העגלה של המשתמש
    const cart = await Cart.findOne(cartQueries.findByUserId(userId));
    if (!cart) {
      throw new CustomError("Cart not found", 404);
    }

    const productIdStr = productId.toString();

  // 2) מחיקת כל הפריטים של אותו productId (הסרה מוחלטת מהעגלה)
    if (variationId) {
      // מוחקים רק את הווריאציה הספציפית
      cart.items = cart.items.filter(
        (item) =>
          !(
            item.productId.toString() === productIdStr &&
            String(item.variationId || "") === String(variationId || "")
          )
      );
    } else {
      // מוחקים את כל הווריאציות של המוצר הזה
      cart.items = cart.items.filter(
        (item) => item.productId.toString() !== productIdStr
      );
    }

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
        variationId: it.variationId ? String(it.variationId) : null,
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
    const prods = await Product.find({ _id: { $in: ids } }).lean();

    const priceMap = Object.fromEntries(prods.map((p) => [String(p._id), p]));


    // 🆕 אם אין עגלה – יוצרים אחת חדשה
    if (!cart) {
      const itemsWithPrice = normalized.map((it) => {
        const product = productMap[it.productId];
        if (!product) {
          throw new Error(`Product not found: ${it.productId}`);
        }
        const price = getCurrentPriceFromProduct(product, it.variationId);
        if (price == null || Number.isNaN(price)) {
          throw new Error(`Invalid price for product: ${it.productId}`);
          // או CustomError אם תרצי
        }
        return {
          productId: it.productId,
          variationId: it.variationId || null,
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
        (row) =>
          String(row.productId) === it.productId &&
          String(row.variationId || "") === String(it.variationId || "")
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
          variationId: it.variationId || null,
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





  async updateItemQuantity(userId, productId, quantity, variationId = null) {
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
    const variationIdStr = variationId ? String(variationId) : "";
    const item = cart.items.find(
     (i) =>
        i.productId.toString() === productIdStr &&
        String(i.variationId || "") === variationIdStr
    );

    if (!item) {
      throw new CustomError("Product not found in cart", 404);
    }

    // אם הכמות 0 או פחות – נסיר את הפריט מהעגלה
    if (q <= 0) {
      cart.items = cart.items.filter(
        (i) =>
          !(
            i.productId.toString() === productIdStr &&
            String(i.variationId || "") === variationIdStr
          )
      );
    } else {
      // אחרת – נעדכן כמות
      item.quantity = q;
    }

    await cart.save();

    const updated = await Cart.findOne(cartQueries.findByUserId(userId))
      .populate("items.productId").lean({ virtuals: true });

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
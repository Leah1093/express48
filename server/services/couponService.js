// services/couponService.js
import { Coupon } from "../models/coupon.js";

class CouponService {
  async create(data) {
    return Coupon.create(data);
  }

  async findByCode(code) {
    return Coupon.findOne({ code });
  }

  /**
   * validateCoupon
   *
   * code: string
   * userId: ObjectId/string
   * cart: { total: number, items: [{ _id, sellerId, quantity, price }] }
   */
  async validateCoupon(code, userId, cart) {
    console.log("\n===== CouponService.validateCoupon START =====");
    console.log("code:", code);
    console.log("userId:", userId?.toString?.() ?? userId);
    console.log("cart (raw):", JSON.stringify(cart, null, 2));

    const coupon = await Coupon.findOne({ code });

    if (!coupon) {
      console.log("Coupon not found for code:", code);
      throw new Error("קופון לא נמצא");
    }

    console.log("Found coupon:", {
      id: coupon._id.toString(),
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      minOrderAmount: coupon.minOrderAmount,
      usageLimit: coupon.usageLimit,
      usagePerUser: coupon.usagePerUser,
      expiryDate: coupon.expiryDate,
      allowedProducts: (coupon.allowedProducts || []).map((id) =>
        id.toString()
      ),
      allowedSellers: (coupon.allowedSellers || []).map((id) => id.toString()),
      allowedUsers: (coupon.allowedUsers || []).map((id) => id.toString()),
    });

    // --- 1) תוקף --- //
    if (coupon.expiryDate && coupon.expiryDate < new Date()) {
      console.log("❌ coupon expired at:", coupon.expiryDate);
      throw new Error("הקופון פג תוקף");
    }

    // --- 2) הגבלת שימוש כוללת --- //
    const totalUsed = (coupon.usedBy || []).reduce(
      (sum, u) => sum + (u.count || 0),
      0
    );
    console.log("totalUsed:", totalUsed, "usageLimit:", coupon.usageLimit);

    if (coupon.usageLimit && totalUsed >= coupon.usageLimit) {
      console.log("❌ coupon usage limit reached");
      throw new Error("הקופון נוצל במלואו");
    }

    // --- 3) שימוש פר משתמש --- //
    if (coupon.usagePerUser) {
      const userUsage = (coupon.usedBy || []).find(
        (u) => u.userId.toString() === userId.toString()
      );
      console.log("userUsage:", userUsage);
      if (userUsage && userUsage.count >= 1) {
        console.log("❌ user already used this coupon");
        throw new Error("כבר השתמשת בקופון זה");
      }
    }

    // --- 4) קופון ללקוחות ספציפיים (allowedUsers) --- //
    if (Array.isArray(coupon.allowedUsers) && coupon.allowedUsers.length > 0) {
      const allowedUserIds = coupon.allowedUsers.map((id) => id.toString());
      console.log("allowedUserIds:", allowedUserIds);

      if (!allowedUserIds.includes(userId.toString())) {
        console.log("❌ user not in allowedUsers");
        throw new Error("הקופון לא זמין עבורך");
      }
    }

    // --- 5) עגלה ופריטים --- //
    const items = Array.isArray(cart?.items) ? cart.items : [];
    const cartTotal = Number(cart?.total ?? 0);

    console.log("cartTotal:", cartTotal);
    console.log(
      "cart.items (normalized):",
      items.map((it) => ({
        _id: it?._id ? String(it._id) : null,
        sellerId: it?.sellerId ? String(it.sellerId) : null,
        quantity: it?.quantity,
        price: it?.price,
      }))
    );

    // --- 6) מינימום סכום הזמנה --- //
    if (cartTotal < (coupon.minOrderAmount || 0)) {
      console.log(
        "❌ cartTotal below minOrderAmount:",
        cartTotal,
        "<",
        coupon.minOrderAmount
      );
      throw new Error(`הקופון תקף רק מעל ${coupon.minOrderAmount}₪`);
    }

    // --- 7) סינון מוצרים / מוכרים רלוונטיים --- //
    const hasProductRestriction =
      Array.isArray(coupon.allowedProducts) &&
      coupon.allowedProducts.length > 0;

    const hasSellerRestriction =
      Array.isArray(coupon.allowedSellers) && coupon.allowedSellers.length > 0;

    console.log("hasProductRestriction:", hasProductRestriction);
    console.log("hasSellerRestriction:", hasSellerRestriction);

    let eligibleItems = items;

    if (hasProductRestriction || hasSellerRestriction) {
      const allowedProductIds = new Set(
        (coupon.allowedProducts || []).map((id) => id.toString())
      );
      const allowedSellerIds = new Set(
        (coupon.allowedSellers || []).map((id) => id.toString())
      );

      console.log("allowedProductIds:", [...allowedProductIds]);
      console.log("allowedSellerIds:", [...allowedSellerIds]);

      eligibleItems = items.filter((item) => {
        const productId = item._id ? String(item._id) : null;
        const sellerId = item.sellerId ? String(item.sellerId) : null;

        const matchProduct = hasProductRestriction
          ? productId && allowedProductIds.has(productId)
          : true;

        const matchSeller = hasSellerRestriction
          ? sellerId && allowedSellerIds.has(sellerId)
          : true;

        console.log("CHECK ITEM:", {
          productId,
          sellerId,
          matchProduct,
          matchSeller,
        });

        // אם יש גם מגבלת מוצר וגם מגבלת מוכר:
        if (hasProductRestriction && hasSellerRestriction) {
          // אם אין לנו בכלל sellerId בעגלה → נתבסס רק על המוצר
          if (!sellerId) {
            return matchProduct;
          }
          // אם יש sellerId → נדרוש גם מוצר מתאים וגם מוכר מתאים
          return matchProduct && matchSeller;
        }

        // רק מוצרים
        if (hasProductRestriction) return matchProduct;

        // רק מוכרים
        if (hasSellerRestriction) return matchSeller;

        return true;
      });

      console.log(
        "eligibleItems AFTER filter:",
        eligibleItems.map((it) => ({
          _id: it?._id ? String(it._id) : null,
          sellerId: it?.sellerId ? String(it.sellerId) : null,
          quantity: it?.quantity,
          price: it?.price,
        }))
      );

      if (eligibleItems.length === 0) {
        console.log("❌ no eligible items for this coupon");
        throw new Error("הקופון לא תקף על המוצרים/המוכרים שנמצאים בעגלה");
      }
    }

    // --- 8) סכום רלוונטי להנחה (רק eligibleItems) --- //
    const eligibleSubtotal = eligibleItems.reduce((sum, item) => {
      const price = Number(item.price ?? 0);
      const qty = Number(item.quantity ?? 0);
      return sum + price * qty;
    }, 0);

    console.log("eligibleSubtotal:", eligibleSubtotal);

    if (eligibleSubtotal <= 0) {
      console.log("❌ eligibleSubtotal <= 0");
      throw new Error("לא נמצאו פריטים מתאימים להנחה");
    }

    // --- 9) חישוב הנחה --- //
    let discount = 0;

    if (coupon.discountType === "percent") {
      discount = (eligibleSubtotal * Number(coupon.discountValue || 0)) / 100;
    } else if (coupon.discountType === "fixed") {
      discount = Math.min(Number(coupon.discountValue || 0), eligibleSubtotal);
    }

    if (!Number.isFinite(discount) || discount < 0) {
      discount = 0;
    }

    const finalTotal = Math.max(cartTotal - discount, 0);

    console.log("CALC RESULT:", {
      cartTotal,
      eligibleSubtotal,
      discount,
      finalTotal,
    });
    console.log("===== CouponService.validateCoupon END =====\n");

    return { coupon, discount, finalTotal };
  }

  async applyCoupon(coupon, userId) {
    if (!coupon.usedBy) {
      coupon.usedBy = [];
    }
      console.log("📌 BEFORE applyCoupon usedBy:", coupon.usedBy);


    const existing = coupon.usedBy.find(
      (u) => u.userId.toString() === userId.toString()
    );

    if (existing) {
      existing.count += 1;
    } else {
      coupon.usedBy.push({ userId, count: 1 });
    }

    await coupon.save();
      console.log("📌 AFTER applyCoupon usedBy:", coupon.usedBy);

    return coupon;
  }

  async deleteById(couponId) {
    const coupon = await Coupon.findById(couponId);
    if (!coupon) {
      throw new Error("קופון לא נמצא");
    }
    await coupon.deleteOne();
    return coupon;
  }

  async updateById(couponId, data) {
    const updated = await Coupon.findByIdAndUpdate(couponId, data, {
      new: true,
      runValidators: true,
    });

    if (!updated) {
      throw new Error("קופון לא נמצא");
    }

    return updated;
  }

  async listBySeller(sellerId) {
    return Coupon.find({ allowedSellers: sellerId }).sort({
      createdAt: -1,
    })
    .populate("allowedProducts", "title sku brand")   // שמות מוצרים
    .populate("allowedUsers", "username email")       // שמות/מיילים של לקוחות
    .populate("allowedSellers", "storeName fullName")     // שמות המוכרים (לפי המודל שלך)
    .populate("usedBy.userId", "username email")      // מי השתמש בקופון
    .lean();
  }
}

export const couponService = new CouponService();

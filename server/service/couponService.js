import { Coupon } from "./models/Coupon.js";

class CouponService {
  async create(data) {
    return Coupon.create(data);
  }

  async findByCode(code) {
    return Coupon.findOne({ code });
  }

  async validateCoupon(code, userId, cart, sellers) {
    const coupon = await Coupon.findOne({ code });
    if (!coupon) throw new Error("קופון לא נמצא");

    // בדיקת תוקף
    if (coupon.expiryDate < new Date()) throw new Error("הקופון פג תוקף");

    // בדיקת הגבלת שימוש כוללת
    if (
      coupon.usageLimit &&
      coupon.usedBy.reduce((sum, u) => sum + u.count, 0) >= coupon.usageLimit
    ) {
      throw new Error("הקופון נוצל במלואו");
    }

    // בדיקת שימוש פר משתמש
    if (coupon.usagePerUser) {
      const userUsage = coupon.usedBy.find(
        (u) => u.userId.toString() === userId.toString()
      );
      if (userUsage && userUsage.count >= 1)
        throw new Error("כבר השתמשת בקופון זה");
    }

    // בדיקת משתמשים מותרים
    if (
      coupon.allowedUsers.length > 0 &&
      !coupon.allowedUsers.map((id) => id.toString()).includes(userId.toString())
    ) {
      throw new Error("הקופון לא זמין עבורך");
    }

    // בדיקת מוכרים
    if (coupon.allowedSellers.length > 0) {
      const sellerIds = sellers.map((s) => s.toString());
      const intersection = coupon.allowedSellers.filter((s) =>
        sellerIds.includes(s.toString())
      );
      if (intersection.length === 0)
        throw new Error("הקופון לא תקף למוצרים שבחרת");
    }

    // בדיקת סכום מינימום
    if (cart.total < coupon.minOrderAmount) {
      throw new Error(`הקופון תקף רק מעל ${coupon.minOrderAmount}₪`);
    }

    return coupon;
  }

  async applyCoupon(coupon, userId) {
    const existing = coupon.usedBy.find(
      (u) => u.userId.toString() === userId.toString()
    );
    if (existing) {
      existing.count += 1;
    } else {
      coupon.usedBy.push({ userId, count: 1 });
    }
    await coupon.save();
    return coupon;
  }
}

export const couponService = new CouponService();

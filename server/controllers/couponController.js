import { couponService } from "../services/couponService.js";

class CouponController {
  async create(req, res, next) {
    try {
      const sellerId = req.user.sellerId
      const coupon = await couponService.create({
        ...req.body,
       allowedSellers: [sellerId], 
    });
      res.status(201).json(coupon);
    } catch (e) {
      next(e);
    }
  }

  async validate(req, res, next) {
    try {
        console.log("BODY:", req.body);
    console.log("USER:", req.user.userId);
      const { code, cart } = req.body;
      const coupon = await couponService.validateCoupon(
        code,
        req.user.userId,
        cart,
        // sellers
      );
       // חישוב הנחה
    let discount = 0;
    if (coupon.discountType === "percent") {
      discount = (cart.total * coupon.discountValue) / 100;
    } else if (coupon.discountType === "fixed") {
      discount = coupon.discountValue;
    }

    const finalTotal = Math.max(cart.total - discount, 0);
      res.json({ valid: true, coupon,discount, finalTotal });
    } catch (e) {
      res.status(400).json({ valid: false, error: e.message });
    }
  }

  async apply(req, res, next) {
    try {
      const { code } = req.body;
      const coupon = await couponService.findByCode(code);
      if (!coupon) throw new Error("קופון לא נמצא");
      await couponService.applyCoupon(coupon, req.user._id);
      res.json({ success: true });
    } catch (e) {
      next(e);
    }
  }
}

export const couponController = new CouponController();

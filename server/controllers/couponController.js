import { couponService } from "../services/CouponService.js";

class CouponController {
  async create(req, res, next) {
    try {
      const coupon = await couponService.create(req.body);
      res.status(201).json(coupon);
    } catch (e) {
      next(e);
    }
  }

  async validate(req, res, next) {
    try {
      const { code, cart, sellers } = req.body;
      const coupon = await couponService.validateCoupon(
        code,
        req.user._id,
        cart,
        sellers
      );
      res.json({ valid: true, coupon });
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

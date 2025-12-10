import { couponService } from "../services/couponService.js";

class CouponController {
  async create(req, res, next) {
    try {
      const sellerId = req.user?.sellerId;
      console.log("=== COUPON CREATE ===");
      console.log("req.user:", req.user);
      console.log("req.body:", req.body);

      const coupon = await couponService.create({
        ...req.body,
        allowedSellers: sellerId ? [sellerId] : req.body.allowedSellers,
      });

      console.log("COUPON CREATED:", coupon?._id?.toString());
      res.status(201).json(coupon);
    } catch (e) {
      console.error("❌ couponController.create error:", e);
      next(e);
    }
  }

  async validate(req, res, next) {
    try {
      console.log("\n==============================");
      console.log("=== /coupons/validate START ===");
      console.log("TIME:", new Date().toISOString());
      console.log("req.user:", req.user);
      console.log("req.body:", JSON.stringify(req.body, null, 2));

      const { code, cart } = req.body;

      const { coupon, discount, finalTotal } =
        await couponService.validateCoupon(
          code,
          req.user.userId,
          cart
        );

      console.log("=== /coupons/validate SUCCESS ===");
      console.log("coupon._id:", coupon?._id?.toString());
      console.log("discount:", discount);
      console.log("finalTotal:", finalTotal);

      res.json({ valid: true, coupon, discount, finalTotal });
    } catch (e) {
      console.error("❌ /coupons/validate ERROR:", e.message);
      console.error(e);
      res.status(400).json({ valid: false, error: e.message });
    }
  }

  async apply(req, res, next) {
    try {
      console.log("=== /coupons/apply START ===");
      console.log("req.user:", req.user);
      console.log("req.body:", req.body);

      const { code } = req.body;

      const coupon = await couponService.findByCode(code);
      if (!coupon) {
        console.error("❌ /coupons/apply: coupon not found for code:", code);
        throw new Error("קופון לא נמצא");
      }

      await couponService.applyCoupon(coupon, req.user.userId);

      console.log("=== /coupons/apply SUCCESS ===");
      res.json({ success: true });
    } catch (e) {
      console.error("❌ /coupons/apply ERROR:", e);
      next(e);
    }
  }

  async delete(req, res, next) {
    try {
      console.log("=== /coupons/:id DELETE ===", req.params.id);
      const { id } = req.params;
      const deleted = await couponService.deleteById(id);
      res.json({ success: true, deleted });
    } catch (e) {
      console.error("❌ /coupons/:id DELETE ERROR:", e);
      next(e);
    }
  }

  async update(req, res, next) {
    try {
      console.log("=== /coupons/:id UPDATE ===", req.params.id);
      console.log("body:", req.body);
      const { id } = req.params;
      const updated = await couponService.updateById(id, req.body);
      res.json(updated);
    } catch (e) {
      console.error("❌ /coupons/:id UPDATE ERROR:", e);
      next(e);
    }
  }

  async list(req, res, next) {
    try {
      const sellerId = req.user?.sellerId;
      console.log("=== /coupons/list for seller ===", sellerId);
      const coupons = await couponService.listBySeller(sellerId);
      res.json(coupons);
    } catch (e) {
      console.error("❌ /coupons/list ERROR:", e);
      next(e);
    }
  }
}

export const couponController = new CouponController();

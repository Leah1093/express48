import { OrderService } from "../services/orderService.js";
import { CustomError } from "../utils/CustomError.js";
import { couponService } from "../services/couponService.js"; // 👈 הוספה


const orderService = new OrderService();

export class OrderController {
  async create(req, res, next) {
    try {
      const userId = req.user.userId;
      const { couponCode, ...orderPayload } = req.body;

      const order = await orderService.createOrder(req.user.userId, orderPayload);
      if (couponCode) {
        try {
          const coupon = await couponService.findByCode(couponCode.trim());
          if (coupon) {
            await couponService.applyCoupon(coupon, userId);
          } else {
            console.warn(
              "OrderController.create: coupon not found for code:",
              couponCode
            );
          }
        } catch (err) {
          // לא מפילים את ההזמנה, רק לוג
          console.error(
            "OrderController.create: failed to apply coupon usage:",
            err
          );
        }
      }
      res.status(201).json(order);
    } catch (err) {
      next(err);
    }
  }

  async list(req, res, next) {
    try {
      const orders = await orderService.getUserOrders(req.user.userId);
      res.json(orders);
    } catch (err) {
      next(err);
    }
  }

  async getOne(req, res, next) {
    try {
      const order = await orderService.getOrderById(
        req.params.id,
        req.user.userId
      );

      if (!order) {
        throw new CustomError("ההזמנה לא נמצאה", 404);
      }

      res.json(order);
    } catch (err) {
      next(err);
    }
  }

  async updateStatus(req, res, next) {
    try {
      const order = await orderService.updateOrderStatus(
        req.params.id,
        req.body.status
      );

      if (!order) {
        throw new CustomError("ההזמנה לא נמצאה", 404);
      }

      res.json(order);
    } catch (err) {
      next(err);
    }
  }

  async remove(req, res, next) {
    try {
      const deleted = await orderService.deleteOrder(
        req.params.id,
        req.user.userId
      );

      if (!deleted) {
        throw new CustomError("ההזמנה לא נמצאה", 404);
      }

      res.json({ message: "ההזמנה נמחקה בהצלחה" });
    } catch (err) {
      next(err);
    }
  }
}

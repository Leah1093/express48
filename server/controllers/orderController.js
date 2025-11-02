import { OrderService } from "../service/orderService.js";
import { CustomError } from "../utils/CustomError.js";

const orderService = new OrderService();

export class OrderController {
  async create(req, res, next) {
    try {
      const order = await orderService.createOrder(req.user.userId, req.body);
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

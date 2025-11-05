import { OrderService } from "../service/orderService.js";
import { createOrderSchema, updateStatusSchema } from "../validations/orderValidation.js";

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
      const order = await orderService.getOrderById(req.params.id, req.user.userId);
      if (!order) return res.status(404).json({ error: "ההזמנה לא נמצאה" });
      res.json(order);
    } catch (err) {
      next(err);
    }
  }

  async updateStatus(req, res, next) {
    try {
    
      const order = await orderService.updateOrderStatus(req.params.id, req.body);
      if (!order) return res.status(404).json({ error: "ההזמנה לא נמצאה" });
      res.json(order);
    } catch (err) {
      next(err);
    }
  }

  async remove(req, res, next) {
    try {
      const deleted = await orderService.deleteOrder(req.params.id, req.user.userId);
      if (!deleted) return res.status(404).json({ error: "ההזמנה לא נמצאה" });
      res.json({ message: "ההזמנה נמחקה בהצלחה" });
    } catch (err) {
      next(err);
    }
  }
}

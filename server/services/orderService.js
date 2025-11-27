import { or } from "ajv/dist/compile/codegen/index.js";
import { Order } from "../models/order.js";
import { CustomError } from "../utils/CustomError.js";
import { Product } from "../models/Product.js";

export class OrderService {
  async createOrder(userId, data) {
    try {
      const { addressId, notes, items } = data;

      if (!items || items.length === 0) {
        throw new CustomError("Order must contain at least one item", 400);
      }

      for (const it of items) {
        if (typeof it.price !== "number" || typeof it.quantity !== "number") {
          throw new CustomError("Each item must have price and quantity", 400);
        }
      }

      const totalAmount = items.reduce((sum, it) => sum + it.price * it.quantity, 0);

      const order = new Order({
        userId,
        addressId,
        items,
        notes: notes || "",
        totalAmount,
      });

      return await order.save();
    } catch (err) {
      if (err instanceof CustomError) throw err;
      throw new CustomError("Failed to create order", 500);
    }
  }

  async getUserOrders(userId) {
    try {
      const orders = await Order.find({ userId })
        .populate("addressId");
      console.log('[OrderService] Fetched user orders:', JSON.stringify(orders));
      const result = [];
      for (const order of orders) {
        const populatedItems = []
        for (const item of order.items) {
          const product = await Product
            .findById(item.productId)
            .select("title price images slug")
            .lean();
          populatedItems.push({
            ...item.toObject(),
            productId: product || null
          });
        }
        result.push({
          ...order.toObject(),
          items: populatedItems
        });
      }
      return result;
    } catch (err) {
      if (err instanceof CustomError) throw err;
      throw new CustomError("Failed to fetch user orders", 500);
    }
  }

  async getOrderById(orderId, userId) {
    try {
      const order = await Order.findOne({ _id: orderId, userId })
        .populate("items.productId", "title price")
        .populate("addressId")
        .populate("userId", "username email");

      if (!order) {
        throw new CustomError("Order not found", 404);
      }

      return order;
    } catch (err) {
      if (err instanceof CustomError) throw err;
      throw new CustomError("Failed to fetch order", 500);
    }
  }

  async updateOrderStatus(orderId, status) {
    try {
      const allowedStatuses = ["pending", "shipped", "delivered", "cancelled"];
      if (!allowedStatuses.includes(status)) {
        throw new CustomError("Invalid status", 400);
      }

      const order = await Order.findByIdAndUpdate(
        orderId,
        { status },
        { new: true }
      );

      if (!order) {
        throw new CustomError("Order not found", 404);
      }

      return order;
    } catch (err) {
      if (err instanceof CustomError) throw err;
      throw new CustomError("Failed to update order status", 500);
    }
  }

  async deleteOrder(orderId, userId) {
    try {
      const order = await Order.findOneAndDelete({ _id: orderId, userId });

      if (!order) {
        throw new CustomError("Order not found", 404);
      }

      return order;
    } catch (err) {
      if (err instanceof CustomError) throw err;
      throw new CustomError("Failed to delete order", 500);
    }
  }

  // מתודות לתמיכה ב-Tranzila webhook
  async getByOrderId(orderId) {
    try {
      const order = await Order.findById(orderId)
        .populate("items.productId", "title price")
        .populate("addressId")
        .populate("userId", "username email");

      return order;
    } catch (err) {
      throw new CustomError("Failed to fetch order by ID", 500);
    }
  }

  async markPaid(orderId, paymentDetails) {
    try {
      const order = await Order.findById(orderId);
      if (!order) {
        throw new CustomError("Order not found", 404);
      }

      order.payment = {
        status: 'paid',
        gateway: paymentDetails.gateway || 'tranzila',
        transactionId: paymentDetails.transaction_index,
        paidAt: new Date(),
        details: paymentDetails
      };

      order.status = 'paid';
      await order.save();

      console.log('[OrderService] Order marked as paid:', orderId);
      return order;
    } catch (err) {
      if (err instanceof CustomError) throw err;
      throw new CustomError("Failed to mark order as paid", 500);
    }
  }

  async logGatewayEvent(orderId, eventData) {
    try {
      const order = await Order.findById(orderId);
      if (!order) {
        return null;
      }

      if (!order.gatewayLog) {
        order.gatewayLog = [];
      }

      order.gatewayLog.push({
        timestamp: new Date(),
        ...eventData
      });

      await order.save();
      return order;
    } catch (err) {
      console.error('[OrderService] Failed to log gateway event:', err);
      return null;
    }
  }
}

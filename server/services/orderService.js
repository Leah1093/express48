// services/orderService.js
import mongoose from "mongoose";
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

      const totalAmount = items.reduce(
        (sum, it) => sum + it.price * it.quantity,
        0
      );

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
      const orders = await Order.aggregate([
        {
          $match: {
            userId: new mongoose.Types.ObjectId(userId),
          },
        },
        {
          $lookup: {
            from: "products",
            let: { productIds: "$items.productId" },
            pipeline: [
              { $match: { $expr: { $in: ["$_id", "$$productIds"] } } },
              { $project: { _id: 1, title: 1, price: 1, images: 1, slug: 1 } },
            ],
            as: "productsLookup",
          },
        },
        {
          $lookup: {
            from: "addresses",
            localField: "addressId",
            foreignField: "_id",
            as: "addressLookup",
          },
        },
        {
          $project: {
            orderId: 1,
            userId: 1,
            totalAmount: 1,
            discountedAmount: 1,
            notes: 1,
            status: 1,
            payment: 1,
            gatewayLog: 1,
            orderDate: 1,
            estimatedDelivery: 1,
            actualDelivery: 1,
            receiptUrl: 1,
            warranty: 1,
            createdAt: 1,
            updatedAt: 1,
            addressId: { $arrayElemAt: ["$addressLookup", 0] },
            items: {
              $map: {
                input: "$items",
                as: "item",
                in: {
                  productId: {
                    $arrayElemAt: [
                      {
                        $filter: {
                          input: "$productsLookup",
                          as: "prod",
                          cond: { $eq: ["$$prod._id", "$$item.productId"] },
                        },
                      },
                      0,
                    ],
                  },
                  quantity: "$$item.quantity",
                  price: "$$item.price",
                  priceAfterDiscount: "$$item.priceAfterDiscount",
                },
              },
            },
          },
        },
        { $sort: { orderDate: -1 } },
      ]);

      return orders;
    } catch (err) {
      if (err instanceof CustomError) throw err;
      throw new CustomError("Failed to fetch user orders", 500);
    }
  }

  async getOrderById(orderId, userId) {
    try {
      const query = userId ? { _id: orderId, userId } : { _id: orderId };

      const order = await Order.findOne(query)
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
      const allowedStatuses = [
        "pending",
        "shipped",
        "delivered",
        "cancelled",
        "paid",
      ];
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

  // כאן משתמשים גם ב־_id וגם ב־orderId (המחרוזת ORD-...)
  async getByOrderId(orderId) {
    try {
      const query = mongoose.isValidObjectId(orderId)
        ? { _id: orderId }
        : { orderId };

      const order = await Order.findOne(query)
        .populate("items.productId", "title price")
        .populate("addressId")
        .populate("userId", "username email");

      return order;
    } catch (err) {
      throw new CustomError("Failed to fetch order by ID", 500);
    }
  }

  async logGatewayEvent(orderId, eventData) {
    try {
      const query = mongoose.isValidObjectId(orderId)
        ? { _id: orderId }
        : { orderId };

      const order = await Order.findOne(query);
      if (!order) return null;

      if (!order.gatewayLog) {
        order.gatewayLog = [];
      }

      order.gatewayLog.push({
        timestamp: new Date(),
        ...eventData,
      });

      await order.save();
      return order;
    } catch (err) {
      return null;
    }
  }

  // ---- פונקציה בשביל Tranzila ----
  // מסמנת הזמנה כ"paid" ומעדכנת מלאי ומספר רכישות
 async markPaid(orderIdOrCode, paymentInfo = {}) {
  try {
    console.log("[OrderService] markPaid CALLED with:", {
      orderIdOrCode,
      paymentInfo,
    });

    // נחפש גם לפי _id של מונגו וגם לפי orderId טקסטואלי (ORD-123...)
    const query = mongoose.isValidObjectId(orderIdOrCode)
      ? { _id: orderIdOrCode }
      : { orderId: orderIdOrCode };

    const order = await Order.findOne(query);

    if (!order) {
      console.error(
        "[OrderService] markPaid: ORDER NOT FOUND:",
        orderIdOrCode
      );
      throw new CustomError("Order not found", 404);
    }

    console.log("[OrderService] order BEFORE update:", {
      id: order._id,
      status: order.status,
      payment: order.payment,
      items: order.items.map((it) => ({
        productId: it.productId,
        quantity: it.quantity,
      })),
    });

    // אם כבר שולם – לא עושים שוב
    if (order.payment?.status === "paid") {
      console.log(
        "[OrderService] markPaid called but order already paid:",
        order._id
      );
      return order;
    }

    const now = new Date();

    // עדכון אובייקט התשלום של ההזמנה
    order.payment = {
      ...(order.payment || {}),
      status: "paid",
      gateway: paymentInfo.gateway || "tranzila",
      transactionId:
        paymentInfo.transaction_index ||
        paymentInfo.transactionId ||
        order.payment?.transactionId ||
        null,
      details: paymentInfo,
      paidAt: now,
    };

    order.status = "paid";
    order.orderDate = order.orderDate || now;

    // עדכון מלאי ורכישות לכל פריט בהזמנה
    for (const item of order.items) {
      if (!item.productId) continue;

      const qty = item.quantity || 1;

      const product = await Product.findById(item.productId);
      if (!product) {
        console.warn(
          "[OrderService] markPaid: product not found for item",
          item.productId
        );
        continue;
      }

      const currentStock =
        typeof product.stock === "number" ? product.stock : 0;
      const newStock = Math.max(0, currentStock - qty);

      await Product.updateOne(
        { _id: product._id },
        {
          $set: {
            stock: newStock,
            inStock: newStock > 0,
            instock: newStock > 0, // לשדה ישן אם קיים
          },
          $inc: {
            purchases: qty,
          },
        }
      );
    }

    await order.save();

    // לוג לתוך gatewayLog
    await this.logGatewayEvent(order._id, {
      gateway: paymentInfo.gateway || "tranzila",
      event: "paid",
      paymentInfo,
    });

    console.log(
      "[OrderService] Order marked as paid and inventory updated:",
      order._id
    );

    return order;
  } catch (err) {
    console.error("[OrderService] markPaid error:", err);
    if (err instanceof CustomError) throw err;
    throw new CustomError("Failed to mark order as paid", 500);
  }
}
}

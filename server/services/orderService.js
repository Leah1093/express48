// services/orderService.js
import mongoose from "mongoose";
import { Order } from "../models/order.js";
import { CustomError } from "../utils/CustomError.js";
import { Product } from "../models/Product.js";
import { AffiliateProfile } from "../models/AffiliateProfile.js";
import { AffiliateCommission } from "../models/AffiliateProfile.js";
import { Address } from "../models/address.js";

export class OrderService {
  async createOrder(userId, data) {
    try {
      const { addressId, guestAddress, notes, items, affiliateRef } = data;
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
      let approvedAffiliateRef = null;
      if (affiliateRef && typeof affiliateRef === "string") {
        const code = affiliateRef.trim();
        if (code) {
          const aff = await AffiliateProfile.findOne({
            code,
            status: "approved",
          }).select("_id code status");
          if (aff) {
            approvedAffiliateRef = code;
          } else {
            approvedAffiliateRef = null;
          }
        }
      }
      // טיפול בכתובת - אם יש guestAddress, ניצור כתובת זמנית
      let finalAddressId = addressId;
      if (!addressId && guestAddress) {
        const tempAddress = new Address({
          userId: null,
          fullName: guestAddress.fullName,
          phone: guestAddress.phone,
          country: guestAddress.country || "IL",
          city: guestAddress.city,
          street: guestAddress.street,
          houseNumber: guestAddress.houseNumber,
          apartment: guestAddress.apartment,
          zip: guestAddress.zip,
          notes: guestAddress.notes || "",
          isDefault: false,
        });
        await tempAddress.save();
        finalAddressId = tempAddress._id;
      }
      if (!finalAddressId && !guestAddress) {
        throw new CustomError("Address is required", 400);
      }
      const order = new Order({
        userId: userId || null,
        addressId: finalAddressId || null,
        guestAddress: guestAddress || undefined,
        items,
        notes: notes || "",
        totalAmount,
        affiliateRef: approvedAffiliateRef,
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
                  variationId: "$$item.variationId",
                  variationAttributes: "$$item.variationAttributes",
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
        .populate("userId", "username email phone firstName lastName mobile");

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
        "processing",
        "shipped",
        "delivered",
        "canceled",
        "returned",
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
        .populate("userId", "username email phone firstName lastName mobile");

      return order;
    } catch (err) {
      throw new CustomError("Failed to fetch order by ID", 500);
    }
  }

  async markPaid(orderIdOrCode, paymentInfo = {}) {
    try {
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
      // אם כבר שולם – לא עושים שוב
      if (order.payment?.status === "paid" || order.status === "paid") {
        return order;
      }
      const now = new Date();
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
      if (order.status !== "canceled" && order.status !== "returned") {
        order.status = order.status === "pending" ? "processing" : order.status;
      }
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
        // אם יש וריאציה - נעדכן את המלאי שלה
        if (item.variationId && Array.isArray(product.variations)) {
          const variationIdStr = String(item.variationId);
          const variation = product.variations.find(
            (v) => String(v._id) === variationIdStr
          );
          if (!variation) {
            console.warn(
              "[OrderService] markPaid: variation not found",
              item.variationId,
              "for product",
              product._id
            );
          } else {
            const currentVarStock =
              typeof variation.stock === "number" ? variation.stock : 0;
            const newVarStock = Math.max(0, currentVarStock - qty);
            variation.stock = newVarStock;
            variation.inStock = newVarStock > 0;
            // מחשבים מחדש מלאי מוצר כסכום כל הווריאציות
            const newProductStock = product.variations.reduce((sum, v) => {
              const s = typeof v.stock === "number" ? v.stock : 0;
              return sum + s;
            }, 0);
            product.stock = newProductStock;
            product.inStock = newProductStock > 0;
            product.instock = newProductStock > 0;
          }
        } else {
          // בלי וריאציה – התנהגות כמו קודם: מורידים מהמלאי הכללי
          const currentStock =
            typeof product.stock === "number" ? product.stock : 0;
          const newStock = Math.max(0, currentStock - qty);
          product.stock = newStock;
          product.inStock = newStock > 0;
          product.instock = newStock > 0;
        }
        // עדכון purchases ברמת מוצר
        const currentPurchases =
          typeof product.purchases === "number" ? product.purchases : 0;
        product.purchases = currentPurchases + qty;
        await product.save();
      }
      await order.save();
      // ✅ יצירת עמלת שותף (Ledger) – רק אם יש affiliateRef
      if (order.affiliateRef) {
        const profile = await AffiliateProfile.findOne({
          code: order.affiliateRef,
          status: "approved",
        }).select("commissionRate code");
        if (profile) {
          const baseAmount =
            typeof order.discountedAmount === "number" &&
            order.discountedAmount > 0
              ? order.discountedAmount
              : order.totalAmount;
          const rate =
            typeof profile.commissionRate === "number"
              ? profile.commissionRate
              : 0;
          const commissionAmount = Math.round(baseAmount * rate * 100) / 100;
          if (commissionAmount > 0) {
            try {
              await AffiliateCommission.create({
                orderMongoId: order._id,
                orderId: order.orderId,
                affiliateCode: profile.code,
                baseAmount,
                commissionRate: rate,
                commissionAmount,
                status: "pending",
              });
            } catch (e) {
              const msg = String(e?.message || "");
              const isDup =
                e?.code === 11000 ||
                msg.toLowerCase().includes("duplicate key");
              if (!isDup) throw e;
            }
          }
        }
      }
      await this.logGatewayEvent(order._id, {
        gateway: paymentInfo.gateway || "tranzila",
        event: "paid",
        paymentInfo,
      });
      return order;
    } catch (err) {
      console.error("[OrderService] markPaid error:", err);
      if (err instanceof CustomError) throw err;
      throw new CustomError("Failed to mark order as paid", 500);
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
      console.error("[OrderService] Failed to log gateway event:", err);
      return null;
    }
  }
}

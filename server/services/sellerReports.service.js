// src/services/sellerReports.service.js
import mongoose from "mongoose";
import { Order } from "../models/order.js";
import { SellerProductsService } from "./sellerProducts.service.js";

// שירות המוצרים של המוכר – כדי להביא את רשימת המוצרים
const productsService = new SellerProductsService();

const toDate = (v) => {
  if (!v) return undefined;
  const d = new Date(v);
  return Number.isFinite(d.getTime()) ? d : undefined;
};

export class SellerReportsService {
  // --- דוח סיכום לפי מוצר ---
  async productSummaryByDateRange({
    sellerId,
    storeId,
    role,
    from,
    to,
    page = 1,
    limit = 20,
  }) {
    // 1. קודם כל – רשימת מוצרים רגילה של המוכר
    const listResult = await productsService.list({
      sellerId,
      storeId,
      role,
      query: {
        page,
        limit,
        // בעתיד: search / status / category וכו'
      },
    });

    const baseItems = listResult.items || [];

    if (!baseItems.length) {
      return {
        items: [],
        page: listResult.page,
        limit: listResult.limit,
        total: listResult.total,
        hasNextPage: listResult.hasNextPage,
      };
    }

    const productIds = baseItems.map(
      (p) => new mongoose.Types.ObjectId(String(p._id))
    );

    const matchOrders = {
      "items.productId": { $in: productIds },
      // אם תרצי: status: { $in: ["paid", "completed"] },
    };

    const dFrom = toDate(from);
    const dTo = toDate(to);
    if (dFrom || dTo) {
      matchOrders.orderDate = {};
      if (dFrom) matchOrders.orderDate.$gte = dFrom;
      if (dTo) matchOrders.orderDate.$lte = dTo;
    }

    const sales = await Order.aggregate([
      { $match: matchOrders },
      { $unwind: "$items" },
      {
        $match: {
          "items.productId": { $in: productIds },
        },
      },
      {
        $group: {
          _id: "$items.productId",
          productId: { $first: "$items.productId" },
          soldQuantity: { $sum: "$items.quantity" },
          totalRevenue: {
            $sum: { $multiply: ["$items.quantity", "$items.price"] },
          },
        },
      },
    ]);

    const salesMap = new Map(sales.map((s) => [String(s.productId), s]));

    const reportItems = baseItems.map((p) => {
      const key = String(p._id);
      const sale = salesMap.get(key);

      const soldQuantity = sale?.soldQuantity ?? 0;
      const totalRevenue = sale?.totalRevenue ?? 0;

      return {
        productId: String(p._id),
        title: p.title,
        sku: p.sku,
        imageUrl:
          Array.isArray(p.images) && p.images.length ? p.images[0] : null,
        currentStock: p.stock ?? 0,
        soldQuantity,
        totalRevenue,
      };
    });

    return {
      items: reportItems,
      page: listResult.page,
      limit: listResult.limit,
      total: listResult.total, // סה"כ מוצרים, לא סה"כ הזמנות
      hasNextPage: listResult.hasNextPage,
    };
  }

  // --- פירוט הזמנות למוצר אחד ---
  async productDetailsByDateRange({
    productId,
    sellerId,
    storeId,
    role,
    from,
    to,
  }) {
    if (!productId) {
      throw new Error("productId is required");
    }

    const prodObjectId = new mongoose.Types.ObjectId(String(productId));

    const matchOrders = {
      "items.productId": prodObjectId,
      // שוב – אפשר להוסיף כאן status אם צריך
    };

    const dFrom = toDate(from);
    const dTo = toDate(to);
    if (dFrom || dTo) {
      matchOrders.orderDate = {};
      if (dFrom) matchOrders.orderDate.$gte = dFrom;
      if (dTo) matchOrders.orderDate.$lte = dTo;
    }

    const rows = await Order.aggregate([
      { $match: matchOrders },
      { $unwind: "$items" },
      {
        $match: {
          "items.productId": prodObjectId,
        },
      },
      {
        $project: {
          _id: 0,
          orderId: "$orderId",
          date: "$orderDate",
          quantity: "$items.quantity",
          unitPrice: "$items.price",
          total: { $multiply: ["$items.quantity", "$items.price"] },
          userId: "$userId",
        },
      },
      { $sort: { date: -1 } },
    ]);

    return {
      productId: String(productId),
      items: rows,
    };
  }
}

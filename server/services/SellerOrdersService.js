import { CustomError } from "../utils/CustomError.js";
import { Order } from "../models/order.js";
import { Product } from "../models/Product.js";

const ALLOWED_STATUSES = [
  "pending",
  "approved",
  "canceled",
  "returned",
  "completed",
  "paid",
];

export class SellerOrdersService {
  /**
   * @param {Object} params
   * @param {string} params.sellerId - מזהה מוכר (ObjectId כ string)
   * @param {string | undefined} params.status - פילטר סטטוס (pending / paid / וכו')
   * @param {string | undefined} params.search - חיפוש חופשי
   */
  async getSellerOrdersForSeller({ sellerId, status, search }) {
    if (!sellerId) {
      throw new CustomError("לא נמצא מזהה מוכר בחשבון", 403);
    }

    // 1) מוצרים של המוכר
    const sellerProducts = await Product.find(
      { sellerId },
      { _id: 1, title: 1, sku: 1, brand: 1, model: 1, images: 1 }
    ).lean();

    if (!sellerProducts.length) {
      return [];
    }

    const productIdSet = new Set(sellerProducts.map((p) => p._id.toString()));

    const productMap = new Map(
      sellerProducts.map((p) => [p._id.toString(), p])
    );

    // 2) בניית query להזמנות שמכילות מוצרים של המוכר
    const orderQuery = {
      "items.productId": { $in: Array.from(productIdSet) },
    };

    if (status) {
      orderQuery.status = status;
    }

    // 3) שליפת ההזמנות עם populate לכתובת (addressId + address ישן) ולמשתמש
    const rawOrders = await Order.find(orderQuery)
      .sort({ createdAt: -1 })
      .populate({
        path: "addressId",
        model: "Address",
        select: "country city street zip notes",
      })
      .populate({
        path: "address", // fallback לשדה ישן אם עדיין קיים
        model: "Address",
        select: "country city street zip notes",
        strictPopulate: false,
      })
      .populate({
        path: "userId",
        model: "User",
        select: "username email phone",
      })
      .lean();
      

    // 4) מיפוי להזמנות עם פריטים רק של המוכר
    let mapped = rawOrders.map((order) => {
      const sellerItems = (order.items || []).filter((it) =>
        productIdSet.has(it.productId.toString())
      );

      const items = sellerItems.map((it) => {
        const product = productMap.get(it.productId.toString());
        const firstImage =
          Array.isArray(product?.images) && product.images[0]
            ? product.images[0]
            : undefined;

        return {
          productId: it.productId.toString(),
          quantity: it.quantity,
          price:
            typeof it.priceAfterDiscount === "number"
              ? it.priceAfterDiscount
              : it.price,
          variationId: it.variationId
            ? it.variationId.toString?.() ?? it.variationId
            : undefined,
          variationAttributes: it.variationAttributes ?? undefined,
          productSnapshot: {
            title: product?.title,
            sku: product?.sku,
            brand: product?.brand,
            model: product?.model,
            thumbnailUrl: firstImage,
          },
        };
      });

      // קודם addressId (חדש), אם אין – נ fallback ל-address (ישן)
      const addr = order.addressId || order.address || {};
      const user = order.userId || {};

      const buyerName = user.username || user.email || undefined;

      const fullAddress = [addr.street, addr.city, addr.zip]
        .filter(Boolean)
        .join(", ");

      return {
        _id: order._id.toString(),
        userId:
          order.userId && order.userId._id
            ? order.userId._id.toString()
            : order.userId?.toString?.(),

        address: {
          country: addr.country,
          city: addr.city,
          street: addr.street,
          zip: addr.zip,
          notes: addr.notes,
          fullAddress,
        },

        totalAmount: order.totalAmount,
        discountedAmount: order.discountedAmount ?? null,
        notes: order.notes || "",
        status: order.status,
        receiptUrl: order.receiptUrl ?? null,
        warranty: order.warranty ?? null,
        orderId: order.orderId,
        orderDate: order.orderDate || order.createdAt,
        createdAt: order.createdAt,
        updatedAt: order.updatedAt,
        items,

        buyerName,
        buyerEmail: user.email,
        buyerPhone: user.phone,
      };
    });

    // 5) חיפוש בצד שרת (אחרי המיפוי – כולל fullAddress)
    if (search) {
      const s = String(search).trim().toLowerCase();
      if (s) {
        mapped = mapped.filter((order) => {
          const haystack = [
            order.orderId,
            order.buyerName,
            order.buyerEmail,
            order.buyerPhone,
            order.address?.city,
            order.address?.street,
            order.address?.zip,
            order.address?.fullAddress,
          ]
            .filter(Boolean)
            .join(" ")
            .toLowerCase();

          return haystack.includes(s);
        });
      }
    }

    return mapped;
  }

  /**
   * עדכון סטטוס הזמנה ע"י מוכר
   */
  async updateOrderStatusForSeller({ sellerId, orderId, status }) {
    if (!sellerId) {
      throw new CustomError("לא נמצא מזהה מוכר בחשבון", 403);
    }

    if (!orderId) {
      throw new CustomError("חסר מזהה הזמנה", 400);
    }

    if (!ALLOWED_STATUSES.includes(status)) {
      throw new CustomError("סטטוס לא חוקי", 400);
    }

    // 1) מוצרים של המוכר
    const sellerProducts = await Product.find({ sellerId }, { _id: 1 }).lean();

    if (!sellerProducts.length) {
      throw new CustomError("אין למוכר זה מוצרים במערכת", 404);
    }

    const productIdSet = new Set(sellerProducts.map((p) => p._id.toString()));

    // 2) עדכון ישיר של סטטוס להזמנה שמכילה מוצר של המוכר
    const updated = await Order.findOneAndUpdate(
      {
        _id: orderId,
        "items.productId": { $in: Array.from(productIdSet) },
      },
      {
        $set: { status },
      },
      {
        new: true,
        runValidators: false, // ⚠️ לא מריצים ולידציה מלאה כדי לא ליפול על addressId חסר
      }
    ).lean();

    if (!updated) {
      throw new CustomError("לא נמצאה הזמנה למוכר זה עם המוצר המבוקש", 404);
    }

    return { success: true };
  }
}

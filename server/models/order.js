import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
  quantity: { type: Number, required: true, min: 1 },
  price: { type: Number, required: true }, // מחיר ליחידה או סכום כולל
  priceAfterDiscount: { type: Number, default: null }, // מחיר אחרי הנחה
  variationId: { type: String, default: null },
  variationAttributes: { type: Map, of: String, default: undefined },
  // 🔹 שיווק שותפים – מועתק מהעגלה בזמן יצירת ההזמנה
  affiliateUser: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  affiliateRefRaw: { type: String, default: null },
});

const orderSchema = new mongoose.Schema(
  {
    orderId: {
      type: String,
      unique: true,
      required: true,
      default: () => `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: false, default: null },
    addressId: { type: mongoose.Schema.Types.ObjectId, ref: "Address", required: false, default: null },
    // שדות כתובת ישירים לאורחים (אם addressId לא מסופק)
    guestAddress: {
      fullName: { type: String, trim: true },
      phone: { type: String, trim: true },
      email: { type: String, trim: true },
      country: { type: String, trim: true, default: "IL" },
      city: { type: String, trim: true },
      street: { type: String, trim: true },
      houseNumber: { type: String, trim: true },
      apartment: { type: String, trim: true },
      zip: { type: String, trim: true },
      notes: { type: String, trim: true, default: "" },
    },
    totalAmount: { type: Number, required: true }, // סכום הזמנה
    discountedAmount: { type: Number, default: null }, // אחרי הנחה
    notes: { type: String, default: "" },
    affiliateRef: { type: String, default: null },
    items: [orderItemSchema],
    status: {
      type: String,
      enum: [
        "pending",
        "approved",
        "processing",
        "shipped",
        "delivered",
        "canceled",
        "returned",
        "completed",
        "paid"
      ],
      default: "pending",
    },
    payment: {
      status: {
        type: String,
        enum: ["pending", "paid", "failed", "refunded"],
        default: "pending",
      },
      gateway: { type: String, default: "tranzila" },
      transactionId: { type: String, default: null },
      paidAt: { type: Date, default: null },
      details: { type: mongoose.Schema.Types.Mixed, default: null },
    },
    gatewayLog: [
      {
        timestamp: { type: Date, default: Date.now },
        gateway: String,
        event: String,
        payload: mongoose.Schema.Types.Mixed,
        verification: mongoose.Schema.Types.Mixed,
      },
    ],
    orderDate: { type: Date, default: Date.now }, // תאריך ביצוע ההזמנה
    estimatedDelivery: { type: Date }, // מועד מסירה משוער
    actualDelivery: { type: Date }, // מועד מסירה בפועל
    receiptUrl: { type: String, default: null }, // קישור/נתיב לקבלה רשמית על ההזמנה
    warranty: { type: String, default: null }, // טקסט או לינק למסמך אחריות
  },
  { timestamps: true }
);

export const Order =
  mongoose.models.Order || mongoose.model("Order", orderSchema);

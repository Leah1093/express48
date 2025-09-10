import mongoose from "mongoose";

const couponSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, unique: true }, // קוד קופון
    discountType: { type: String, enum: ["percent", "fixed"], required: true }, // אחוז/סכום קבוע
    discountValue: { type: Number, required: true }, // כמה אחוז או כמה ₪
    expiryDate: { type: Date, required: true }, // תאריך תוקף
    usageLimit: { type: Number, default: null }, // הגבלה כללית (סה"כ שימושים לכל הקופון)
    usagePerUser: { type: Boolean, default: false }, // האם מותר פעם אחת לכל משתמש
    minOrderAmount: { type: Number, default: 0 }, // מינימום הזמנה
    allowedSellers: [{ type: mongoose.Schema.Types.ObjectId, ref: "Seller" }], // הגבלה לפי מוכרים
    allowedUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }], // קופונים ללקוחות ספציפיים
    restrictionType: {
      type: String,
      enum: ["none", "specificUsers", "birthday", "abandonedCart"],
      default: "none",
    },
    allowedUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],

    usedBy: [
      {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        count: { type: Number, default: 0 },
      },
    ], // מעקב אחרי מי השתמש וכמה פעמים
  },
  { timestamps: true }
);

// תמיד להחזיר את אותו מודל אם כבר הוגדר (במנוע dev זה חשוב)
export const Coupon =
  mongoose.models.Coupon || mongoose.model("Coupon", couponSchema);

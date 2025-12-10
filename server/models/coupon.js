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

    // הגבלות
    allowedSellers: [{ type: mongoose.Schema.Types.ObjectId, ref: "Seller" }],
    allowedProducts: [{ type: mongoose.Schema.Types.ObjectId, ref: "Product" }],
    allowedUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],

    restrictionType: {
      type: String,
      enum: ["none", "specificUsers", "specificProducts","specificUsersAndProducts"],
      default: "none",
    },

    // מעקב שימושים
    usedBy: [
      {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        count: { type: Number, default: 0 },
      },
    ],
  },
  { timestamps: true }
);

export const Coupon =
  mongoose.models.Coupon || mongoose.model("Coupon", couponSchema);

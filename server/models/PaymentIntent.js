import mongoose from "mongoose";

const logSchema = new mongoose.Schema({
  at: { type: Date, default: Date.now },
  payload: { type: Object, default: {} },
}, { _id: false });

const paymentIntentSchema = new mongoose.Schema({
  orderId: { type: String, required: true },                 // מזהה הזמנה פנימי
  gateway: { type: String, required: true, default: "mock" },// ספק פעיל
  gatewayDealId: { type: String },                           // מזהה עסקה אצל הספק
  status: { type: String, enum: ["pending","paid","failed","canceled"], default: "pending" },
  amount: { type: Number, required: true },
  currency: { type: String, default: "ILS" },
  returnValue: { type: String, unique: true, index: true },  // מפתח לאימות/וובהוק
  log: [logSchema],
}, { timestamps: true });

export default mongoose.model("PaymentIntent", paymentIntentSchema);

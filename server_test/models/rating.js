// models/Rating.js
import mongoose from "mongoose";

const mediaSchema = new mongoose.Schema({
  kind:     { type: String, enum: ["image", "video"], required: true },
  url:      { type: String, required: true, trim: true },
  width:    { type: Number, default: null },
  height:   { type: Number, default: null },
  duration: { type: Number, default: null }, // שניות לוידאו
}, { _id: false });

const sellerReplySchema = new mongoose.Schema({
  text:          { type: String, trim: true, maxlength: 800, required: true },
  visible:       { type: Boolean, default: true, index: true },
  repliedBy:     { type: mongoose.Schema.Types.ObjectId, ref: "User",   required: true },
  sellerId:      { type: mongoose.Schema.Types.ObjectId, ref: "Seller", required: true },
  editedBy:      { type: mongoose.Schema.Types.ObjectId, ref: "User",   default: null },
  editableUntil: { type: Date, required: true }, // חלון עריכה 24 שעות
  deletedAt:     { type: Date, default: null },  // מחיקה רכה של התגובה
  deletedBy:     { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
}, { _id: false, timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" } });

const ratingSchema = new mongoose.Schema({
  // קשרים
  productId:   { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true, index: true },
  sellerId:    { type: mongoose.Schema.Types.ObjectId, ref: "Seller",  required: true, index: true },
  userId:      { type: mongoose.Schema.Types.ObjectId, ref: "User",    required: true, index: true },
  orderId:     { type: mongoose.Schema.Types.ObjectId, ref: "Order",   required: true },
  orderItemId: { type: mongoose.Schema.Types.ObjectId,                 required: true, index: true },
  variationId: { type: mongoose.Schema.Types.ObjectId, default: null },

  // תוכן
  stars:    { type: Number, min: 1, max: 5, required: true },
  text:     { type: String, trim: true, maxlength: 800, default: "" },
  images:   { type: [mediaSchema], default: [] },
  videos:   { type: [mediaSchema], default: [] },
  hasMedia: { type: Boolean, default: false },

  // אימות ותצוגה
  verifiedPurchase: { type: Boolean, default: false, index: true },
  anonymous:        { type: Boolean, default: false },

  // סטטוס וניהול
  status:    { type: String, enum: ["approved","rejected"], default: "approved", index: true },
  deletedAt: { type: Date, default: null }, // מחיקה רכה של הדירוג עצמו
  yearMonth: { type: String, index: true }, // YYYY-MM

  // דירוגי “מועיל”
  likesCount:    { type: Number, default: 0 },
  dislikesCount: { type: Number, default: 0 },

  // חלון עריכה ללקוח (אם רלוונטי אצלך)
  editableUntil: { type: Date },

  // תגובת מוכר יחידה
  sellerReply:   { type: sellerReplySchema, default: null },

  // Audit בסיסי
  updatedBy:  { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  deletedBy:  { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  restoredBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
}, { timestamps: true });

// אינדקסים
ratingSchema.index({ productId: 1, status: 1, createdAt: -1 });
ratingSchema.index({ sellerId: 1, status: 1 });
ratingSchema.index({ hasMedia: 1 });
ratingSchema.index({ sellerId: 1, "sellerReply.visible": 1, createdAt: -1 });
ratingSchema.index({ "sellerReply.createdAt": -1 });
ratingSchema.index({ "sellerReply.deletedAt": 1 });

// ביקורת אחת פר־שורת הזמנה
ratingSchema.index({ orderItemId: 1 }, { unique: true });

// שגרות יצירה/עדכון
ratingSchema.pre("save", function(next){
  // חישוב דגל מדיה
  this.hasMedia = (this.images?.length || 0) + (this.videos?.length || 0) > 0;

  // חותמת חודש לשאילתות אנליטיות
  if (this.isNew) {
    const d = new Date();
    this.yearMonth = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}`;
    // חלון עריכה ללקוח (אם רוצים) – כאן דוגמה ל־6 שעות:
    if (!this.editableUntil) {
      const SIX_H = 6 * 60 * 60 * 1000;
      this.editableUntil = new Date(Date.now() + SIX_H);
    }
  }
  next();
});

export const Rating = mongoose.models.Rating || mongoose.model("Rating", ratingSchema);

import mongoose from "mongoose";

/**
 * Counter – מונה רץ ל-SKU לפי הקשר:
 * storeId + supplier + category
 */
const counterSchema = new mongoose.Schema(
  {
    storeId:  { type: String, required: true, index: true }, // חנות
    supplier: { type: String, required: true, index: true }, // ספק/יצרן (Apple)
    category: { type: String, required: true, index: true }, // קבוצה (טלפונים/טלוויזיות/GEN)
    seq:      { type: Number, required: true, default: 0 },  // המספר הרץ
    note:     { type: String, default: "" }                  // לא חובה – לתיעוד
  },
  { timestamps: true }
);

// ייחודיות לכל שילוב חנות+ספק+קטגוריה
counterSchema.index(
  { storeId: 1, supplier: 1, category: 1 },
  { unique: true, name: "uniq_counter_scope" }
);

// ↑ מעלה את המונה ומחזיר את הערך החדש
counterSchema.statics.getNextSeq = async function ({ storeId, supplier, category, incBy = 1 }) {
  if (!storeId || !supplier || !category) {
    throw new Error("Counter.getNextSeq requires storeId, supplier, and category");
  }
  const query  = { storeId, supplier, category };
  const update = { $inc: { seq: incBy } };
  const opts   = { new: true, upsert: true, setDefaultsOnInsert: true };
  const doc = await this.findOneAndUpdate(query, update, opts).lean();
  return doc.seq;
};

// הצצה בערך קיים בלי להגדיל
counterSchema.statics.peekSeq = async function ({ storeId, supplier, category }) {
  const doc = await this.findOne({ storeId, supplier, category }).lean();
  return doc?.seq ?? 0;
};

// איפוס (לא חובה, שימושי לבדיקות/תחזוקה)
counterSchema.statics.resetSeq = async function ({ storeId, supplier, category }) {
  const query  = { storeId, supplier, category };
  const update = { $set: { seq: 0 } };
  const opts   = { new: true, upsert: true, setDefaultsOnInsert: true };
  const doc = await this.findOneAndUpdate(query, update, opts).lean();
  return doc.seq;
};

export const Counter = mongoose.models.Counter || mongoose.model("Counter", counterSchema);

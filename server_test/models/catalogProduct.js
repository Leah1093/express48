// ---------- Subschemas ----------
const DiscountSchema = new mongoose.Schema({
  discountType: { type: String, enum: ["percent", "fixed"], required: true }, // ← סוג הנחה
  discountValue: { type: Number, required: true, min: 0 }, // ← ערך הנחה
  startsAt: { type: Date },   // ← תאריך התחלה
  expiresAt: { type: Date },  // ← תאריך סיום
}, { _id: false });

DiscountSchema.path("discountValue").validate(function (v) {
  if (this.discountType === "percent") return v >= 0 && v <= 100; // ← אחוז בין 0–100
  return v >= 0; // ← קבוע לא שלילי
}, "Invalid discountValue for discountType");

const PriceSchema = new mongoose.Schema({
  amount: { type: Number, required: true, min: 0 }, // ← מחיר במטבע המוצר
}, { _id: false });

// ---------- Variation Schema ----------
const variationSchema = new mongoose.Schema({
  _id: { type: mongoose.Schema.Types.ObjectId, auto: true }, // ← מזהה טכני ייחודי
  sku: { type: String, index: true },        // ← SKU פנימי (של המערכת)
  sellerSku: { type: String, default: "" },  // ← SKU של המוכר (אופציונלי)
  gtin: { type: String, default: "", index: true, sparse: true }, // ← ברקוד
  attributes: { type: Map, of: String, default: {} }, // ← מאפיינים (צבע, מידה, אחסון וכו׳)
  price: { type: PriceSchema, required: false },       // ← מחיר וריאציה
  discount: { type: DiscountSchema, required: false }, // ← הנחת וריאציה
  stock: { type: Number, default: 0 },   // ← מלאי וריאציה
  inStock: { type: Boolean, default: false }, // ← יש במלאי (נגזר)
  images: { type: [String], default: [] },    // ← תמונות
});

// ---------- Product Schema ----------
const productSchema = new mongoose.Schema({
  supplier: { type: String },   // ← ספק
  sellerId: { type: mongoose.Schema.Types.ObjectId, ref: "Seller", index: true, required: true },// ← מזהה מוכר
  storeId: { type: mongoose.Schema.Types.ObjectId, ref: "Store", index: true, required: true }, // ← מזהה חנות

  slug: { type: String, minlength: 3, maxlength: 100, index: true }, // ← כתובת URL ידידותית
  metaTitle: { type: String, default: "" },       // ← כותרת SEO
  metaDescription: { type: String, default: "" }, // ← תיאור SEO

  title: { type: String, required: true },    // ← שם מוצר בעברית
  titleEn: { type: String, default: "" },     // ← שם באנגלית
  description: { type: String, default: "" }, // ← תיאור מלא
  brand: { type: String, default: "" },       // ← מותג
  category: { type: String, default: "אחר" }, // ← קטגוריה ראשית
  subCategory: { type: String, default: "" }, // ← קטגוריית משנה
  overview: {
    text: { type: String, default: "" },      // ← סקירה טקסטואלית
    images: { type: [String], default: [] },  // ← תמונות סקירה
    videos: { type: [String], default: [] },  // ← סרטוני סקירה
  },

  gtin: { type: String, default: "", index: true, sparse: true }, // ← ברקוד ראשי
  sku: { type: String, index: true },    // ← SKU פנימי
  sellerSku: { type: String, default: "" },  // ← SKU של המוכר (אופציונלי)

  model: { type: String, default: "" },     // ← דגם יצרן

  currency: { type: String, default: "ILS" },  // ← מטבע
  price: { type: PriceSchema, required: true }, // ← מחיר מוצר
  discount: { type: DiscountSchema, required: false }, // ← הנחת מוצר

  variations: [variationSchema], // ← וריאציות

  stock: { type: Number, default: 0 },    // ← מלאי כולל
  inStock: { type: Boolean, default: false }, // ← במלאי

  views: { type: Number, default: 0 },     // ← צפיות
  purchases: { type: Number, default: 0 }, // ← רכישות

  specs: { type: Map, of: String, default: {} }, // ← מפרט טכני (מפה חופשית)
  images: { type: [String], default: [] },       // ← תמונות מוצר
  video: { type: String, default: "" },          // ← סרטון מוצר

  ratings: { // ← דירוגים
    sum: { type: Number, default: 0 },    // ← סה"כ כוכבים
    avg: { type: Number, default: 0 },    // ← ממוצע
    count: { type: Number, default: 0 },  // ← מספר מדרגים
    breakdown: {                          // ← פיזור דירוגים
      1: { type: Number, default: 0 },
      2: { type: Number, default: 0 },
      3: { type: Number, default: 0 },
      4: { type: Number, default: 0 },
      5: { type: Number, default: 0 },
    }
  },

  status: { type: String, enum: ["draft", "published", "suspended"], default: "draft", index: true }, // ← סטטוס פנימי
  visibility: { type: String, enum: ["public", "private", "restricted"], default: "public" }, // ← מי רואה
  scheduledAt: { type: Date },  // ← מועד התחלה
  visibleUntil: { type: Date }, // ← מועד סיום

  warranty: { type: String, default: "12 חודשים אחריות יבואן רשמי" }, // ← אחריות

  shipping: {
    dimensions: {                // ← מידות
      length: { type: Number, default: 0, min: 0 },
      width: { type: Number, default: 0, min: 0 },
      height: { type: Number, default: 0, min: 0 },
    },
    weightKg: { type: Number, default: 0, min: 0 }, // ← משקל בק"ג
    from: { type: String, default: "IL" },          // ← מדינת מקור
  },
  delivery: {
    requiresDelivery: { type: Boolean, default: false }, // ← האם דורש הובלה מיוחדת
    cost: { type: Number, default: 0 },   // ← עלות הובלה
    notes: { type: String, default: "" }, // ← הערות
  },

  legacyPrice: { type: Number }, // ← תאימות ישנה
  image: { type: String },       // ← תאימות ישנה

  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // ← מי יצר
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // ← מי עדכן
}, { timestamps: true }); // ← יוצר createdAt + updatedAt

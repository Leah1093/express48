// models/Product.js — גרסה משופרת ומוקשחת
import mongoose from "mongoose";
import { Counter } from "./counter.js"; // ← מונה אוטומטי ל-SKU
import { getAllowedVariationKeysForCategory } from "../config/variationAttributes.js"; // ← מאפייני וריאציה מותרים לפי קטגוריה

// ---------- Helpers ----------
function slugifyEn(str = "") {
  return String(str)
    .trim()
    .toLowerCase()
    .replace(/&/g, " and ")            // & → and
    .replace(/[^a-z0-9\s-]/g, "")      // רק a-z0-9 רווחים ומקפים
    .replace(/\s+/g, "-")              // רווחים → מקפים
    .replace(/-+/g, "-")                // איחוד מקפים כפולים
    .replace(/^-|-$/g, "")              // הסרת מקף בתחילה/סוף
    .slice(0, 100);
}

function cleanText(s = "") {
  return String(s).replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim();
}

function toMaxLen(s, n) {
  s = cleanText(s || "");
  return s.length <= n ? s : s.slice(0, n - 1).trim() + "…";
}

// נירמול עברית לחיפוש: הסרת ניקוד/גרשיים, סופיות → רגילות, lowercase
const FINAL_MAP = { "ך": "כ", "ם": "מ", "ן": "נ", "ף": "פ", "ץ": "צ" };
function normalizeHebrew(str = "") {
  let s = String(str)
    .replace(/[\u0591-\u05C7]/g, "")   // ניקוד
    .replace(/[\u05F3\u05F4'\"]/g, "") // גרשיים עבריים/לועזיים
    .replace(/[^\u0590-\u05FF0-9A-Za-z\s-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  s = s.replace(/[ךםןףץ]/g, ch => FINAL_MAP[ch] || ch);
  return s.toLowerCase();
}

const isNumFinite = (x) => typeof x === "number" && Number.isFinite(x);

function buildMetaTitle(doc) {
  const parts = [];
  if (doc.title) parts.push(doc.title);
  const brandModel = [doc.brand, doc.model].filter(Boolean).join(" ");
  if (brandModel && !String(doc.title || "").includes(brandModel)) parts.push(brandModel);
  parts.push("משלוח מהיר 48 שעות", "EXPRESS48");
  const raw = cleanText(parts.filter(Boolean).join(" - "));
  return toMaxLen(raw, 60);
}

function buildMetaDescription(doc) {
  const title = doc.title || [doc.brand, doc.model].filter(Boolean).join(" ") || "מוצר";
  const usp = doc.delivery?.requiresDelivery ? "כולל הובלה והתקנה" : "משלוח מהיר עד 48 שעות";
  const base = `${title} עם אחריות יבואן רשמי. ${usp}. קונים חכם – מקבלים מהר. EXPRESS48.`;
  return toMaxLen(base, 160);
}

function isDiscountActive(d) {
  if (!d) return false;
  if (!["percent", "fixed"].includes(d.discountType)) return false;
  const now = new Date();
  if (d.expiresAt && new Date(d.expiresAt) < now) return false;
  if (d.startsAt && new Date(d.startsAt) > now) return false;
  return typeof d.discountValue === "number" && d.discountValue >= 0;
}

function applyDiscount(baseAmount, discount) {
  if (!isDiscountActive(discount)) return { final: baseAmount, saved: 0 };
  if (discount.discountType === "percent") {
    const saved = Math.max(0, (baseAmount * (discount.discountValue || 0)) / 100);
    return { final: Math.max(0, baseAmount - saved), saved };
  }
  if (discount.discountType === "fixed") {
    const saved = Math.min(baseAmount, Math.max(0, discount.discountValue || 0));
    return { final: Math.max(0, baseAmount - saved), saved };
  }
  return { final: baseAmount, saved: 0 };
}

// ---------- Subschemas ----------
const DiscountSchema = new mongoose.Schema({
  discountType: { type: String, enum: ["percent", "fixed"], required: true },
  discountValue: { type: Number, required: true, min: 0 },
  startsAt: { type: Date },
  expiresAt: { type: Date },
}, { _id: false });

DiscountSchema.pre("validate", function (next) {
  if (this.startsAt && this.expiresAt && this.expiresAt < this.startsAt) {
    return next(new Error("discount.expiresAt must be after discount.startsAt"));
  }
  next();
});

const PriceSchema = new mongoose.Schema({
  amount: { type: Number, required: true, min: 0 },
}, { _id: false });

const gtinValidator = (v) => {
  if (!v) return true;
  return /^[0-9]{8,14}$/.test(v); // GTIN/UPC/EAN בסיסי
};

// ---------- Variation Schema ----------
const variationSchema = new mongoose.Schema({
  _id: { type: mongoose.Schema.Types.ObjectId, auto: true },
  sku: { type: String, index: true },
  sellerSku: { type: String, default: "" },
  gtin: { type: String, index: true, sparse: true, validate: [gtinValidator, "GTIN לא חוקי"] },
  attributes: { type: Map, of: String, default: {} },
  price: { type: PriceSchema, required: false },
  discount: { type: DiscountSchema, required: false },
  stock: { type: Number, default: 0 },
  inStock: { type: Boolean, default: false },
  images: { type: [String], default: [] },
});

// אימות שמפתחות attributes מותרים לפי קטגוריה של המוצר
// variationSchema.path("attributes").validate({
//   validator: function (val) {
//     if (!val) return true;
//     const keys = val instanceof Map ? Array.from(val.keys()) : Object.keys(val);
//     if (!keys.length) return true;
//     const parentDoc = typeof this.ownerDocument === "function" ? this.ownerDocument() : (typeof this.parent === "function" ? this.parent() : null);
//     const category = parentDoc?.category;
//     const allowed = new Set(getAllowedVariationKeysForCategory(category) || []);
//     return keys.every(k => allowed.has(k));
//   },
//   message: () => `attributes מכיל מפתח וריאציה שאינו מותר עבור קטגוריה זו`,
// });

// ---------- Product Schema ----------
const productSchema = new mongoose.Schema({
  supplier: { type: String },
  sellerId: { type: mongoose.Schema.Types.ObjectId, ref: "Seller", index: true, required: true },
  storeId: { type: mongoose.Schema.Types.ObjectId, ref: "Store", index: true, required: true },

  // SEO
  slug: { type: String, minlength: 3, maxlength: 100, index: true },
  metaTitle: { type: String, default: "" },
  metaDescription: { type: String, default: "" },

  // חיפוש עברית
  title_he_plain: { type: String, index: true },
  brand_he_plain: { type: String, index: true },
  description_he_plain: { type: String, index: true },
  model_he_plain: { type: String, index: true },

  // מידע מוצר
  title: { type: String, required: true },
  titleEn: { type: String, default: "" },
  description: { type: String, default: "" },
  brand: { type: String, default: "" },
  category: { type: String, default: "אחר" },
  subCategory: { type: String, default: "" },
  overview: {
    text: { type: String, default: "" },
    images: { type: [String], default: [] },
    videos: { type: [String], default: [] },
  },

  // מזהים
  gtin: { type: String, index: true, sparse: true, validate: [gtinValidator, "GTIN לא חוקי"] },
  sku: { type: String, index: true, minlength: 8, maxlength: 64 },
  sellerSku: { type: String, default: "" },

  model: { type: String, default: "" },

  // תמחור
  currency: { type: String, default: "ILS" },
  price: { type: PriceSchema, required: true },
  discount: { type: DiscountSchema, required: false },

  defaultVariationId: {
    type: mongoose.Schema.Types.ObjectId,
    required: false, // לא חובה, רק אם יש וריאציות
  },

  // וריאציותש
  variations: [variationSchema],

  // מלאי
  stock: { type: Number, default: 0 },
  inStock: { type: Boolean, default: false },

  // אנליטיקות
  views: { type: Number, default: 0 },
  purchases: { type: Number, default: 0 },

  // מפרט
  specs: { type: Map, of: String, default: {} },
  images: { type: [String], default: [] },
  video: { type: String, default: "" },

  // דירוגים
  ratings: {
    sum: { type: Number, default: 0 },
    avg: { type: Number, default: 0 },
    count: { type: Number, default: 0 },
    breakdown: {
      1: { type: Number, default: 0 },
      2: { type: Number, default: 0 },
      3: { type: Number, default: 0 },
      4: { type: Number, default: 0 },
      5: { type: Number, default: 0 },
    },
  },

  // נראות
  status: { type: String, enum: ["draft", "published", "suspended"], default: "draft", index: true },
  publishedAt: { type: Date },

  visibility: { type: String, enum: ["public", "private", "restricted"], default: "public" },
  scheduledAt: { type: Date },
  visibleUntil: { type: Date },

  warranty: { type: String, default: "12 חודשים אחריות יבואן רשמי" },

  // שילוח והובלה
  shipping: {
    dimensions: {
      length: { type: Number, default: 0, min: 0 },
      width: { type: Number, default: 0, min: 0 },
      height: { type: Number, default: 0, min: 0 },
    },
    weightKg: { type: Number, default: 0, min: 0 },
    from: { type: String, default: "IL" },
  },
  delivery: {
    requiresDelivery: { type: Boolean, default: false },
    cost: { type: Number, default: 0 },
    notes: { type: String, default: "" },
  },

  isDeleted: { type: Boolean, default: false, index: true },
  deletedAt: { type: Date, default: null },
  deletedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  restoredAt: { type: Date, default: null },
  restoredBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

  // --- מסחור וחיפוש ---
  tags: { type: [String], default: [], index: true },     // תגים חופשיים לפילטרים/קמפיינים
  aliases: { type: [String], default: [], index: true },  // שמות חלופיים לחיפוש (S24U, וכו')

  // --- דגלונים להצגה ב-UI ---
  badges: {
    // isNew: { type: Boolean, default: false },    // נקבע אוטומטית לפי זמן
    isBestSeller: { type: Boolean, default: false },    // נקבע לפי purchases
    isRecommended: { type: Boolean, default: false },    // נקבע לפי ratings
  },

  // --- מעורבות/מדדים ---
  wishlistCount: { type: Number, default: 0, min: 0 },   // כמה שמרו למועדפים
  lastPurchasedAt: { type: Date },
  // תאימות ישנה
  legacyPrice: { type: Number },
  image: { type: String },

  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
}, { timestamps: true });



// ---------- Indexes ----------
productSchema.index({ storeId: 1, sku: 1 }, { unique: true, sparse: true });
productSchema.index({ storeId: 1, slug: 1 }, { unique: true, sparse: true });
productSchema.index({ storeId: 1, gtin: 1 }, { unique: true, sparse: true });
productSchema.index({ title: "text", brand: "text", model: "text", description: "text" });

// חיפוש עברית — אינדקסים פשוטים
productSchema.index({ title_he_plain: 1 });
productSchema.index({ brand_he_plain: 1 });
productSchema.index({ description_he_plain: 1 });
productSchema.index({ model_he_plain: 1 });

// ---------- Middleware ----------
// חישוב מלאי כולל + inStock
productSchema.pre("save", function (next) {
  if (Array.isArray(this.variations) && this.variations.length > 0) {
    this.stock = this.variations.reduce((sum, v) => sum + (v.stock || 0), 0);
    this.variations.forEach((v) => { v.inStock = (v.stock || 0) > 0; });
  }
  this.inStock = (this.stock || 0) > 0;
  next();
});

// יצירת SKU אוטומטי למוצר
productSchema.pre("save", async function (next) {
  if (this.sku && this.sku.trim()) return next();
  try {
    const storeId = String(this.storeId || "GLB");
    const supplier = this.supplier || "GLB";
    const category = this.category || "GEN";

    const norm = (s = "") => String(s).replace(/[^a-z0-9]/gi, "").slice(0, 3).toUpperCase() || "GEN";

    let nextSeq;
    if (typeof Counter.getNextSeq === "function") {
      nextSeq = await Counter.getNextSeq({ storeId, supplier, category });
    } else {
      const doc = await Counter.findOneAndUpdate(
        { storeId, supplier, category },
        { $inc: { seq: 1 } },
        { new: true, upsert: true, setDefaultsOnInsert: true }
      ).lean();
      nextSeq = (doc && typeof doc.seq === "number") ? doc.seq : 1; // הגנה לברירת מחדל
    }

    const brandPart = norm(this.brand || "GEN");
    const categoryPart = norm(category || "CAT");
    const storePart = norm(storeId);
    const supplierPart = norm(supplier);
    const seqPart = String(nextSeq).padStart(6, "0"); // מרחב גדול יותר

    this.sku = `${storePart}-${supplierPart}-${categoryPart}-${brandPart}-${seqPart}`;
    next();
  } catch (err) {
    next(err);
  }
});

// ולידציה של טווחי נראות
productSchema.pre("validate", function (next) {
  if (this.scheduledAt && this.visibleUntil && this.visibleUntil < this.scheduledAt) {
    return next(new Error("visibleUntil must be after scheduledAt"));
  }
  next();
});

// productSchema middleware
productSchema.pre("save", function (next) {
  if (this.isModified("status")) {
    if (this.status === "published" && !this.publishedAt) {
      this.publishedAt = new Date();
    } else if (this.status !== "published") {
      this.publishedAt = undefined; // או להשאיר - תלוי בצורך העסקי
    }
  }
  next();
});


// יצירת SKU אוטומטי לכל וריאציה
productSchema.pre("save", function (next) {
  if (Array.isArray(this.variations)) {
    this.variations.forEach((v, idx) => {
      if (!v.sku || !v.sku.trim()) {
        const base = this.sku || "PRD";
        v.sku = `${base}-VAR-${idx + 1}`;
      }
    });
  }
  next();
});
productSchema.pre("validate", function (next) {
  // אם gtin ריק/לא תקין – אל תאחסן בכלל (ייתר את ההתנגשות באינדקס ה-sparse)
  if (typeof this.gtin === "string" && this.gtin.trim() === "") {
    this.gtin = undefined;
  }
  // אם יש ערך אך לא עומד ברגקס – גם נסיר (או תחליט לזרוק שגיאה)
  if (this.gtin && !/^[0-9]{8,14}$/.test(this.gtin)) {
    this.invalidate("gtin", "GTIN לא חוקי");
    // או: this.gtin = undefined;  // אם מעדיפים לאחסן בלי GTIN במקום לזרוק שגיאה
  }
  next();
});

// SEO אוטומטי
productSchema.pre("save", function (next) {
  const hasManualTitle = this.isModified("metaTitle") && this.metaTitle && this.metaTitle.trim();
  const hasManualDesc = this.isModified("metaDescription") && this.metaDescription && this.metaDescription.trim();
  const seoEdited = hasManualTitle || hasManualDesc;

  if (!seoEdited) {
    if (this.isModified("title") || this.isModified("brand") || this.isModified("model")) {
      this.metaTitle = toMaxLen(cleanText(buildMetaTitle(this)), 60);
    }
    if (this.isModified("title") || this.isModified("brand") || this.isModified("model") || this.isModified("delivery")) {
      this.metaDescription = toMaxLen(cleanText(buildMetaDescription(this)), 160);
    }
  } else {
    if (this.metaTitle) this.metaTitle = toMaxLen(cleanText(this.metaTitle), 60);
    if (this.metaDescription) this.metaDescription = toMaxLen(cleanText(this.metaDescription), 160);
  }
  next();
});
productSchema.path("images").validate(function (arr) {
  if (this.status === "published") {
    return Array.isArray(arr) && arr.length > 0;
  }
  return true;
}, "מוצר מפורסם חייב לכלול לפחות תמונה אחת");
// ולידציה של מחיר
productSchema.pre("validate", function (next) {
  if (!this.price || !isNumFinite(this.price.amount)) {
    return next(new Error("price.amount של מוצר הוא שדה חובה ומספר תקין"));
  }
  if (this.price.amount < 0) {
    return next(new Error("price.amount של מוצר לא יכול להיות שלילי"));
  }
  for (const v of this.variations || []) {
    if (v?.price?.amount != null) {
      if (!isNumFinite(v.price.amount)) return next(new Error("price.amount של וריאציה חייב להיות מספר תקין"));
      if (v.price.amount < 0) return next(new Error("price.amount של וריאציה לא יכול להיות שלילי"));
    }
  }
  next();
});

// שדות plain לעברית — עדכון בכל שמירה
productSchema.pre("save", function (next) {
  this.title_he_plain = normalizeHebrew(this.title);
  this.brand_he_plain = normalizeHebrew(this.brand);
  this.description_he_plain = normalizeHebrew(this.description);
  this.model_he_plain = normalizeHebrew(this.model);
  next();
});

// Slug אוטומטי (אל תשנה אחרי פרסום אלא אם ערכו ידנית)
productSchema.pre("validate", function (next) {
  const allowAuto = this.status !== "published" || !this.slug || this.isNew;
  if (!this.slug || (this.isModified("titleEn") && allowAuto)) {
    const base = (this.titleEn && this.titleEn.trim()) || [this.brand, this.model, this.sku].filter(Boolean).join(" ") || String(this._id || "");
    let s = slugifyEn(base);
    if (!s || s.length < 3) s = `item-${String(this._id || Date.now()).slice(-6)}`;
    this.slug = s;
  }
  next();
});

// פתרון התנגשויות slug פר-חנות
productSchema.pre("save", async function (next) {
  if (!this.isModified("slug") && !this.isNew) return next();
  this.slug = slugifyEn(this.slug);
  if (this.slug.length < 3) this.slug = `item-${String(this._id || Date.now()).slice(-6)}`;

  const exists = async (s) => !!(await this.constructor.exists({ _id: { $ne: this._id }, storeId: this.storeId, slug: s }));
  let candidate = this.slug;
  let i = 2;
  while (await exists(candidate)) {
    candidate = slugifyEn(`${this.slug}-${i++}`);
  }
  this.slug = candidate;
  next();
});

productSchema.pre(/^find/, function (next) {
  const { includeDeleted } = this.getOptions(); // ← קורא מאופציות, לא מהפילטר
  if (!includeDeleted) {
    this.where({ isDeleted: false });
  }
  next();
});


// שמירת עקביות דירוגים אם breakdown השתנה
productSchema.pre("save", function (next) {
  if (this.isModified("ratings.breakdown")) {
    const b = this.ratings?.breakdown || {};
    const sum = (b[1] || 0) * 1 + (b[2] || 0) * 2 + (b[3] || 0) * 3 + (b[4] || 0) * 4 + (b[5] || 0) * 5;
    const count = (b[1] || 0) + (b[2] || 0) + (b[3] || 0) + (b[4] || 0) + (b[5] || 0);
    this.ratings.sum = sum;
    this.ratings.count = count;
    this.ratings.avg = count ? Number((sum / count).toFixed(2)) : 0;
  }
  next();
});

productSchema.pre("validate", function (next) {
  if (this.variations?.length > 0 && !this.defaultVariationId) {
    return next(new Error("Product with variations must have a defaultVariationId"));
  }
  next();
});


// ---------- Methods ----------
productSchema.methods.getEffectivePricing = function (variationId = null) {
  const currency = this.currency || "ILS";
  let baseAmount = this.price?.amount ?? 0;
  let discount = this.discount || null;
  let priceSource = "product";
  let discountSource = discount ? "product" : null;

  if (variationId) {
    const v = (this.variations || []).find((x) => String(x._id) === String(variationId));
    if (v) {
      if (v.price?.amount != null) {
        baseAmount = v.price.amount;
        priceSource = "variation";
      }
      if (v.discount) {
        discount = v.discount;
        discountSource = "variation";
      }
    }
  }

  const { final, saved } = applyDiscount(baseAmount, discount);
  return {
    currency,
    baseAmount,
    finalAmount: final,
    savedAmount: saved,
    hasDiscount: isDiscountActive(discount) && saved > 0,
    priceSource,
    discountSource,
  };
};

export const Product = mongoose.models.Product || mongoose.model("Product", productSchema);
import mongoose from "mongoose";
import { Counter } from "./counter.js";
import { getAllowedVariationKeysForCategory } from "../config/variationAttributes.js";

function slugifyEn(str = "") {
  return String(str)
    .trim()
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 100);
}

function cleanText(s = "") {
  return String(s).replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim();
}

function toMaxLen(s, n) {
  s = cleanText(s || "");
  return s.length <= n ? s : s.slice(0, n - 1).trim() + "…";
}

const FINAL_MAP = { "ך": "כ", "ם": "מ", "ן": "נ", "ף": "פ", "ץ": "צ" };
function normalizeHebrew(str = "") {
  let s = String(str)
    .replace(/[\u0591-\u05C7]/g, "")
    .replace(/[\u05F3\u05F4'"]/g, "")
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
// ממש בתחילת הקובץ, אחרי האימפורטים והפונקציות העוזרות:

const OverviewBlockSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["text", "image", "video"],
      required: true,
    },

    // ---- TEXT ----
    html: { type: String }, // טקסט בפורמט HTML

    // ---- IMAGE ----
    url: { type: String }, // קישור לתמונה
    alt: { type: String },
    sourceType: {
      type: String,
      enum: ["upload", "url"],
      default: "url",
    },
    publicId: { type: String }, // אם נשמר ב-cloudinary

    // ---- VIDEO ----
    videoUrl: { type: String },
    provider: { type: String }, // "youtube" / "vimeo" / "file" וכו'
  },
  { _id: true, timestamps: false }
);

const VariationTermSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },          // ה־id שאת מייצרת ב־crypto.randomUUID
    label: { type: String, required: true },       // "ורוד" / "L" / "256GB"
    priceType: {
      type: String,
      enum: ["none", "addon", "override"],
      default: "none",
    },
    price: { type: Number },                       // תוספת / מחיר סופי (אופציונלי)
    images: { type: [String], default: [] },       // 👈 כאן התמונות למונח
  },
  { _id: false } // אין צורך ב-_id נוסף, יש לך id משלך
);
const VariationAttributeSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },        // slug: "color" / "size" / "storage"
    displayName: { type: String, required: true }, // "צבע" / "מידה"...
    terms: { type: [VariationTermSchema], default: [] },
  },
  { _id: false }
);




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
  return /^[0-9]{8,14}$/.test(v);
};

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
  active: { type: Boolean, default: true },      // האם הווריאציה פעילה למכירה
  _calculatedPrice: { type: Number },            // המחיר שחושב לפי הכללים
  _manualOverride: { type: Number },             // מחיר ידני אם דרסת את המחושב

});

const productSchema = new mongoose.Schema({
  supplier: { type: String },
  sellerId: { type: mongoose.Schema.Types.ObjectId, ref: "Seller", index: true, required: true },
  storeId: { type: mongoose.Schema.Types.ObjectId, ref: "Store", index: true, required: true },

  slug: { type: String, minlength: 3, maxlength: 100, index: true },
  metaTitle: { type: String, default: "" },
  metaDescription: { type: String, default: "" },

  title_he_plain: { type: String },
  brand_he_plain: { type: String },
  description_he_plain: { type: String },
  model_he_plain: { type: String },

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
    blocks: { type: [OverviewBlockSchema], default: [] },
  },

  gtin: { type: String, index: true, sparse: true, validate: [gtinValidator, "GTIN לא חוקי"] },
  sku: { type: String, index: true, minlength: 8, maxlength: 64 },
  sellerSku: { type: String, default: "" },

  model: { type: String, default: "" },

  currency: { type: String, default: "ILS" },
  price: { type: PriceSchema, required: true },
  discount: { type: DiscountSchema, required: false },

  variationsConfig: {
    priceRule: { type: String, default: "base" },  // או מה שבחרת אצלך (לוגיקה בפרונט)
    attributes: { type: [VariationAttributeSchema], default: [] },
  },

  defaultVariationId: {
    type: mongoose.Schema.Types.ObjectId,
    required: false,
  },

  variations: [variationSchema],

  stock: { type: Number, default: 0 },
  inStock: { type: Boolean, default: false },

  views: { type: Number, default: 0 },
  purchases: { type: Number, default: 0 },

  specs: { type: Map, of: String, default: {} },
  images: { type: [String], default: [] },
  video: { type: String, default: "" },

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

  status: { type: String, enum: ["draft", "published", "suspended"], default: "draft", index: true },
  publishedAt: { type: Date },

  visibility: { type: String, enum: ["public", "private", "restricted"], default: "public" },
  scheduledAt: { type: Date },
  visibleUntil: { type: Date },

  warranty: { type: String, default: "12 חודשים אחריות יבואן רשמי" },

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
    timeDays: { type: Number, default: 2, min: 0 },
  },

  isDeleted: { type: Boolean, default: false, index: true },
  deletedAt: { type: Date, default: null },
  deletedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  restoredAt: { type: Date, default: null },
  restoredBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

  tags: { type: [String], default: [], index: true },
  aliases: { type: [String], default: [], index: true },

  badges: {
    isBestSeller: { type: Boolean, default: false },
    isRecommended: { type: Boolean, default: false },
  },

  wishlistCount: { type: Number, default: 0, min: 0 },
  _importSkipPriceValidation: { type: Boolean, default: false, select: false },
  lastPurchasedAt: { type: Date },

  legacyPrice: { type: Number },
  image: { type: String },

  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

  // --- קישור מלא לעץ קטגוריות ---
  primaryCategoryId: { type: mongoose.Schema.Types.ObjectId, ref: "Category" },
  categoryPathIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "Category" }],
  categoryFullSlug: { type: String, index: true }, // <<<< חשוב בשביל /by-category
  breadcrumbs: [{
    id: { type: mongoose.Schema.Types.ObjectId, ref: "Category", required: true },
    name: { type: String, required: true },
    slug: { type: String, required: true },
    fullSlug: { type: String, required: true },
    depth: { type: Number, required: true },
  }],

}, { timestamps: true });


productSchema.index({ storeId: 1, sku: 1 }, { unique: true, sparse: true });
productSchema.index({ storeId: 1, slug: 1 }, { unique: true, sparse: true });
productSchema.index({ storeId: 1, gtin: 1 }, { unique: true, sparse: true });

productSchema.index({ title: "text", brand: "text", model: "text", description: "text" });

productSchema.index({ title_he_plain: 1 });
productSchema.index({ brand_he_plain: 1 });
productSchema.index({ model_he_plain: 1 });
productSchema.index({ description_he_plain: 1 });

productSchema.index({ aliases: 1 });

productSchema.index({ isDeleted: 1, status: 1, visibility: 1, updatedAt: -1 });

productSchema.index({ primaryCategoryId: 1 });
productSchema.index({ categoryPathIds: 1 });
productSchema.index({ categoryFullSlug: 1 }); // לשאילתת by-category

productSchema.pre("validate", function (next) {
  // אם יש וריאציות ואין עדיין ברירת מחדל – נקח את הראשונה
  if (Array.isArray(this.variations) && this.variations.length > 0) {
    if (!this.defaultVariationId) {
      this.defaultVariationId = this.variations[0]._id;
    }
  } else {
    // אם אין וריאציות – ודא שלא נשאר defaultVariationId ישן
    this.defaultVariationId = undefined;
  }

  next();
});
productSchema.pre("save", function (next) {
  if (Array.isArray(this.variations) && this.variations.length > 0) {
    this.stock = this.variations.reduce((sum, v) => sum + (v.stock || 0), 0);
    this.variations.forEach((v) => { v.inStock = (v.stock || 0) > 0; });
  }
  this.inStock = (this.stock || 0) > 0;
  next();
});

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
      nextSeq = (doc && typeof doc.seq === "number") ? doc.seq : 1;
    }

    const brandPart = norm(this.brand || "GEN");
    const categoryPart = norm(category || "CAT");
    const storePart = norm(storeId);
    const supplierPart = norm(supplier);
    const seqPart = String(nextSeq).padStart(6, "0");

    this.sku = `${storePart}-${supplierPart}-${categoryPart}-${brandPart}-${seqPart}`;
    next();
  } catch (err) {
    next(err);
  }
});

productSchema.pre("validate", function (next) {
  if (this.scheduledAt && this.visibleUntil && this.visibleUntil < this.scheduledAt) {
    return next(new Error("visibleUntil must be after scheduledAt"));
  }
  next();
});

productSchema.pre("save", function (next) {
  if (this.isModified("status")) {
    if (this.status === "published" && !this.publishedAt) {
      this.publishedAt = new Date();
    } else if (this.status !== "published") {
      this.publishedAt = undefined;
    }
  }
  next();
});

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
  if (typeof this.gtin === "string" && this.gtin.trim() === "") {
    this.gtin = undefined;
  }
  if (this.gtin && !/^[0-9]{8,14}$/.test(this.gtin)) {
    this.invalidate("gtin", "GTIN לא חוקי");
  }
  next();
});

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


productSchema.pre("save", function (next) {
  this.title_he_plain = normalizeHebrew(this.title);
  this.brand_he_plain = normalizeHebrew(this.brand);
  this.description_he_plain = normalizeHebrew(this.description);
  this.model_he_plain = normalizeHebrew(this.model);
  next();
});

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
  const { includeDeleted } = this.getOptions();
  if (!includeDeleted) {
    this.where({ isDeleted: false });
  }
  next();
});

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
function buildOverviewBlocksFromLegacy(overview = {}) {
  if (!overview) return [];

  // אם כבר יש blocks עם תוכן – לא נוגעים
  if (Array.isArray(overview.blocks) && overview.blocks.length > 0) {
    return overview.blocks;
  }

  const blocks = [];

  if (overview.text) {
    blocks.push({
      _id: new mongoose.Types.ObjectId(),
      type: "text",
      html: overview.text,
    });
  }

  if (Array.isArray(overview.images)) {
    overview.images
      .filter(Boolean)
      .forEach((url) => {
        blocks.push({
          _id: new mongoose.Types.ObjectId(),
          type: "image",
          url,
          sourceType: "url",
        });
      });
  }

  if (Array.isArray(overview.videos)) {
    overview.videos
      .filter(Boolean)
      .forEach((videoUrl) => {
        blocks.push({
          _id: new mongoose.Types.ObjectId(),
          type: "video",
          videoUrl,
        });
      });
  }

  return blocks;
}

// סטטיק על המודל למקרה שתרצי להשתמש בשירותים שונים
productSchema.statics.buildOverviewBlocksFromLegacy = buildOverviewBlocksFromLegacy;


export const Product = mongoose.models.Product || mongoose.model("Product", productSchema);

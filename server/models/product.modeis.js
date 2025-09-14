import mongoose from "mongoose";
import slugify from "slugify";

const ImageSchema = new mongoose.Schema(
  {
    url: { type: String, required: true },      // URL מלא לתצוגה
    key: { type: String },                      // מזהה בקבצים - S3 וכד'
    alt: { type: String, default: "" },
    isPrimary: { type: Boolean, default: false },
    width: { type: Number },
    height: { type: Number }
  },
  { _id: false }
);

const VariantSchema = new mongoose.Schema(
  {
    sku: { type: String, trim: true },
    barcode: { type: String, trim: true },
    price: { type: Number, min: 0 },
    stock: { type: Number, min: 0, default: 0 },
    attributes: { type: Map, of: String }       // לדוגמה: {color: 'red', size: 'M'}
  },
  { _id: false }
);

const ProductSchema = new mongoose.Schema(
  {
    sellerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },

    title: { type: String, required: true, trim: true, maxlength: 180 },
    slug: { type: String,trim: true },         // ייחודי פר מוכר
    // slug: { type: String, required: true, trim: true },         // ייחודי פר מוכר
    description: { type: String, default: "" },

    sku: { type: String, trim: true },
    barcode: { type: String, trim: true },

    price: { type: Number, required: true, min: 0 },
    compareAtPrice: { type: Number, min: 0 },
    currency: { type: String, default: "ILS" },

    stock: { type: Number, default: 0, min: 0 },

    categoryId: { type: mongoose.Schema.Types.ObjectId, ref: "Category", index: true },
    attributes: { type: Map, of: String },                      // מאפיינים כלליים
    variants: [VariantSchema],                                  // וריאציות אופציונליות

    images: { type: [ImageSchema], default: [] },

    dimensions: {
      length: { type: Number, min: 0 },
      width: { type: Number, min: 0 },
      height: { type: Number, min: 0 }
    },
    weight: { type: Number, min: 0 },

    status: {
      type: String,
      enum: ["draft", "pending", "published", "hidden", "archived"],
      default: "draft",
      index: true
    },

    isDeleted: { type: Boolean, default: false, index: true },

    seo: {
      title: { type: String, trim: true, maxlength: 180 },
      description: { type: String, trim: true, maxlength: 300 }
    },

    // מטא
    publishedAt: { type: Date },
    rejectedReason: { type: String, trim: true }
  },
  {
    timestamps: true,
    versionKey: false,
    toJSON: {
      virtuals: true,
      transform: (_, ret) => {
        delete ret.__v;
        return ret;
      }
    }
  }
);

// אינדקסים
ProductSchema.index({ sellerId: 1, slug: 1 }, { unique: true });
ProductSchema.index({ title: "text", description: "text" });
ProductSchema.index({ status: 1, categoryId: 1 });

// הפקת slug אוטומטי
function makeSlug(str) {
  return slugify(str || "", { lower: true, strict: true, trim: true });
}

ProductSchema.pre("validate", function nextSlug(next) {
  if (!this.slug && this.title) this.slug = makeSlug(this.title);
  next();
});

// שמירה על ייחודיות slug למוכר
ProductSchema.pre("save", async function ensureUniqueSlug(next) {
  if (!this.isModified("title") && !this.isModified("slug")) return next();
  const base = makeSlug(this.slug || this.title);
  let candidate = base;
  let i = 1;
  // נסיון עד שמוצאים ייחודי פר מוכר
  // נדרש sellerId קיים
  while (
    await mongoose.models.Product.exists({
      _id: { $ne: this._id },
      sellerId: this.sellerId,
      slug: candidate
    })
  ) {
    i += 1;
    candidate = `${base}-${i}`;
  }
  this.slug = candidate;
  next();
});

// סינון רך של מחוקים כבררת מחדל
function notDeletedFilter() {
  if (this.getFilter && this.getFilter().withDeleted) return; // אפשר לעקוף עם withDeleted:true
  this.where({ isDeleted: false });
}
ProductSchema.pre("find", notDeletedFilter);
ProductSchema.pre("findOne", notDeletedFilter);
ProductSchema.pre("countDocuments", notDeletedFilter);
ProductSchema.pre("aggregate", function notDeletedAggregate() {
  const first = this.pipeline()[0];
  const hasMatch = first && first.$match;
  if (hasMatch && Object.prototype.hasOwnProperty.call(hasMatch, "withDeleted")) {
    // אם מישהו הוסיף withDeleted בשאילתה - נסיר אותו ולא נוסיף פילטר
    delete hasMatch.withDeleted;
    return;
  }
  this.pipeline().unshift({ $match: { isDeleted: false } });
});

// מתודות עזר
ProductSchema.methods.isOwner = function (userId) {
  return String(this.sellerId) === String(userId);
};

ProductSchema.methods.softDelete = async function () {
  this.isDeleted = true;
  return this.save();
};

ProductSchema.statics.publish = async function (id, { byAdmin = false } = {}) {
  const doc = await this.findById(id);
  if (!doc) return null;
  doc.status = byAdmin ? "published" : "pending";
  if (doc.status === "published") doc.publishedAt = new Date();
  return doc.save();
};

export const Product = mongoose.model("Product", ProductSchema);

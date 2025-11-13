// import mongoose from "mongoose";
// import slugify from "slugify";
// import { Category } from "./category.js"; // ודאי שהנתיב נכון


// const ImageSchema = new mongoose.Schema(
//   {
//     url: { type: String, required: true }, // URL מלא לתצוגה
//     key: { type: String }, // מזהה בקבצים - S3 וכד'
//     alt: { type: String, default: "" },
//     isPrimary: { type: Boolean, default: false },
//     width: { type: Number },
//     height: { type: Number },
//   },
//   { _id: false }
// );

// const VariantSchema = new mongoose.Schema(
//   {
//     sku: { type: String, trim: true },
//     barcode: { type: String, trim: true },
//     price: { type: Number, min: 0 },
//     stock: { type: Number, min: 0, default: 0 },
//     attributes: { type: Map, of: String }, // לדוגמה: {color: 'red', size: 'M'}
//   },
//   { _id: false }
// );

// const ProductSchema = new mongoose.Schema(
//   {
//     sellerId: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "User",
//       required: true,
//       index: true,
//     },

//     title: { type: String, required: true, trim: true, maxlength: 180 },
//     slug: { type: String, trim: true }, // ייחודי פר מוכר
//     // slug: { type: String, required: true, trim: true },         // ייחודי פר מוכר
//     description: { type: String, default: "" },

//     sku: { type: String, trim: true },
//     barcode: { type: String, trim: true },

//     price: { type: Number, required: true, min: 0 },
//     compareAtPrice: { type: Number, min: 0 },
//     currency: { type: String, default: "ILS" },

//     stock: { type: Number, default: 0, min: 0 },

//     categoryId: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "Category",
//       index: true,
//     },
//     attributes: { type: Map, of: String }, // מאפיינים כלליים
//     variants: [VariantSchema], // וריאציות אופציונליות

//     images: { type: [ImageSchema], default: [] },

//     dimensions: {
//       length: { type: Number, min: 0 },
//       width: { type: Number, min: 0 },
//       height: { type: Number, min: 0 },
//     },
//     weight: { type: Number, min: 0 },

//     status: {
//       type: String,
//       enum: ["draft", "pending", "published", "hidden", "archived"],
//       default: "draft",
//       index: true,
//     },

//     isDeleted: { type: Boolean, default: false, index: true },

//     seo: {
//       title: { type: String, trim: true, maxlength: 180 },
//       description: { type: String, trim: true, maxlength: 300 },
//     },

//     // מטא
//     publishedAt: { type: Date },
//     rejectedReason: { type: String, trim: true },
//   },
//   {
//     // --- Category linkage (normalized) ---
//     primaryCategoryId: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "Category",
//       required: true,
//     },
//     categoryPathIds: [
//       {
//         type: mongoose.Schema.Types.ObjectId,
//         ref: "Category",
//         required: true,
//       },
//     ],
//     categoryFullSlug: { type: String, required: true, index: true },

//     // אופציונלי לתצוגה/SEO/לחם פירורים:
//     breadcrumbs: [
//       {
//         id: {
//           type: mongoose.Schema.Types.ObjectId,
//           ref: "Category",
//           required: true,
//         },
//         name: { type: String, required: true },
//         slug: { type: String, required: true },
//         fullSlug: { type: String, required: true },
//         depth: { type: Number, required: true },
//       },
//     ],

//     timestamps: true,
//     versionKey: false,
//     toJSON: {
//       virtuals: true,
//       transform: (_, ret) => {
//         delete ret.__v;
//         return ret;
//       },
//     },
//   }
// );

// // אינדקסים
// ProductSchema.index({ sellerId: 1, slug: 1 }, { unique: true });
// ProductSchema.index({ title: "text", description: "text" });
// ProductSchema.index({ status: 1, categoryId: 1 });
// productSchema.index({ primaryCategoryId: 1 });
// productSchema.index({ categoryPathIds: 1 });
// productSchema.index({ categoryFullSlug: 1 });


// // הפקת slug אוטומטי
// function makeSlug(str) {
//   return slugify(str || "", { lower: true, strict: true, trim: true });
// }

// ProductSchema.pre("validate", function nextSlug(next) {
//   if (!this.slug && this.title) this.slug = makeSlug(this.title);
//   next();
// });

// // שמירה על ייחודיות slug למוכר
// ProductSchema.pre("save", async function ensureUniqueSlug(next) {
//   if (!this.isModified("title") && !this.isModified("slug")) return next();
//   const base = makeSlug(this.slug || this.title);
//   let candidate = base;
//   let i = 1;
//   // נסיון עד שמוצאים ייחודי פר מוכר
//   // נדרש sellerId קיים
//   while (
//     await mongoose.models.Product.exists({
//       _id: { $ne: this._id },
//       sellerId: this.sellerId,
//       slug: candidate,
//     })
//   ) {
//     i += 1;
//     candidate = `${base}-${i}`;
//   }
//   this.slug = candidate;
//   next();
// });

// // סינון רך של מחוקים כבררת מחדל
// function notDeletedFilter() {
//   if (this.getFilter && this.getFilter().withDeleted) return; // אפשר לעקוף עם withDeleted:true
//   this.where({ isDeleted: false });
// }
// ProductSchema.pre("find", notDeletedFilter);
// ProductSchema.pre("findOne", notDeletedFilter);
// ProductSchema.pre("countDocuments", notDeletedFilter);
// ProductSchema.pre("aggregate", function notDeletedAggregate() {
//   const first = this.pipeline()[0];
//   const hasMatch = first && first.$match;
//   if (
//     hasMatch &&
//     Object.prototype.hasOwnProperty.call(hasMatch, "withDeleted")
//   ) {
//     // אם מישהו הוסיף withDeleted בשאילתה - נסיר אותו ולא נוסיף פילטר
//     delete hasMatch.withDeleted;
//     return;
//   }
//   this.pipeline().unshift({ $match: { isDeleted: false } });
// });

// // מתודות עזר
// ProductSchema.methods.isOwner = function (userId) {
//   return String(this.sellerId) === String(userId);
// };

// ProductSchema.methods.softDelete = async function () {
//   this.isDeleted = true;
//   return this.save();
// };

// ProductSchema.statics.publish = async function (id, { byAdmin = false } = {}) {
//   const doc = await this.findById(id);
//   if (!doc) return null;
//   doc.status = byAdmin ? "published" : "pending";
//   if (doc.status === "published") doc.publishedAt = new Date();
//   return doc.save();
// };
// productSchema.pre("validate", async function (next) {
//   try {
//     // אם כבר הכל מלא – דלגי
//     const hasAll =
//       this.primaryCategoryId &&
//       Array.isArray(this.categoryPathIds) && this.categoryPathIds.length > 0 &&
//       typeof this.categoryFullSlug === "string" && this.categoryFullSlug.trim();

//     if (hasAll) return next();

//     let leaf = null;

//     // קדימות: אם הועבר primaryCategoryId בבקשה
//     if (this.primaryCategoryId) {
//       leaf = await Category.findById(this.primaryCategoryId).lean();
//     }

//     // אם לא – נסה לפי categoryFullSlug (למשל: "electronics/computers-mobile/laptops/lenovo")
//     if (!leaf && this.categoryFullSlug) {
//       leaf = await Category.findOne({ fullSlug: this.categoryFullSlug }).lean();
//     }

//     if (!leaf) {
//       return next(new Error("Category leaf not found. Provide primaryCategoryId or categoryFullSlug"));
//     }

//     // בוני מסלול מלא: ancestors + leaf
//     const ids = [...(leaf.ancestors || []), leaf._id];

//     // שליפת פרטי כל הצמתים כדי לבנות breadcrumbs
//     const nodes = await Category.find(
//       { _id: { $in: ids } },
//       { name: 1, slug: 1, fullSlug: 1, depth: 1 }
//     ).lean();

//     // מיון לפי עומק עולה (0 → leaf.depth)
//     const byDepth = [...nodes].sort((a, b) => (a.depth || 0) - (b.depth || 0));

//     // מילוי השדות הסופיים
//     this.primaryCategoryId = leaf._id;
//     this.categoryPathIds = ids;
//     this.categoryFullSlug = leaf.fullSlug;

//     this.breadcrumbs = byDepth.map(n => ({
//       id: n._id,
//       name: n.name,
//       slug: n.slug,
//       fullSlug: n.fullSlug,
//       depth: n.depth ?? 0,
//     }));

//     // תאימות לשדות הישנים (לא חובה, נוח ל־UI הקיים):
//     const level2 = byDepth.find(n => n.depth === 1);
//     const level3 = byDepth.find(n => n.depth === 2);
//     if (level2) this.category = level2.name;       // למשל "מחשבים וסלולר"
//     if (level3) this.subCategory = level3.name;    // למשל "מחשבים ניידים"

//     next();
//   } catch (err) {
//     next(err);
//   }
// });


// export const Product = mongoose.model("Product", ProductSchema);

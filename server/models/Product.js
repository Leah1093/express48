import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  externalId: Number, // id מה-API
  title: String,
  price: Number,
  description: String,
  category: String,
  image: String,
  rating: {
    rate: Number,
    count: Number
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export const Product =  mongoose.models.Product || mongoose.model('Product', productSchema);


// models/Product.js
// import mongoose from "mongoose";

// const variationSchema = new mongoose.Schema({
//   sku: { type: String },         // מזהה פנימי ייחודי לוריאציה הזו
//   attributes: {                  // מאפייני הווריאציה
//     color: { type: String },   // צבע (למשל "שחור", "אדום")
//     size: { type: String },   // מידה (למשל "M", "L")
//     storage: { type: String },   // נפח אחסון (למשל "128GB")
//   },
//   price: {                         // מחיר של הווריאציה
//     currency: { type: String, default: "ILS" }, // מטבע (ILS, USD וכו')
//     amount: { type: Number, required: true }, // סכום בפועל
//   },
//   stock: { type: Number, default: 0 },  // כמה יחידות יש במלאי עבור וריאציה זו
//   images: [{ type: String }],            // רשימת תמונות ספציפיות לוריאציה (קישורים)
// }, { _id: false });

// const productSchema = new mongoose.Schema({
//   // זיהוי חיצוני לפי ספק
//   supplier: { type: String, index: true },      // לדוגמה: "supplierA"
//   sellerId: { type: String, index: true },      // מזהה אצל הספק
//   storeId: { type: String, index: true }, // מזהה חנות (shop/Store)

//   // מידע כללי
//   title: { type: String, required: true },   // שם המוצר (כותרת להצגה ללקוח)
//   description: { type: String, default: "" },      // תיאור מפורט של המוצר
//   brand: { type: String, default: "" },      // שם המותג (למשל Samsung, Nike)
//   category: { type: String, default: "אחר" },   // קטגוריה ראשית (למשל "אלקטרוניקה")
//   subCategory: { type: String, default: "" },      // קטגוריית משנה (למשל "סמארטפונים")
//   overview: {
//     text: { type: String, default: "" },      // סקירה כללית כתובה
//     images: [{ type: String, default: [] }],    // תמונות סקירה (מערך URL-ים/נתיבים)
//     videos: [{ type: String, default: [] }]     // ✨ מערך סרטוני סקירה (URL-ים/נתיבים)
//   },


//   gtin: { type: String, default: "" },            // מזהה ייחודי עולמי (ברקוד – EAN/UPC/ISBN)
//   sku: { type: String, index: true },            //  SKU פנימי ייחודי למוצר (מזהה מלאי פנימי)
//   model: { type: String, default: "" },            // דגם יצרן (למשל Galaxy S23)

//   // מחיר חדש – אובייקט
//   price: {                                        // מחיר כללי (יכול להיות מחיר ברירת מחדל או בסיסי)
//     currency: { type: String, default: "ILS" },   // מטבע (ILS, USD וכו')
//     amount: { type: Number, required: true }    // הסכום בפועל
//   },

//   // תמיכה בווריאציות – אופציונלי
//   variations: [variationSchema],

//   // ✅ מלאי כללי של המוצר (סיכום כל הווריאציות או לשימוש במוצרים בלי וריאציות)
//   stock: { type: Number, default: 0 },

//   views: { type: Number, default: 0 }, // כמה פעמים צפו במוצר
//   purchases: { type: Number, default: 0 }, // כמה פעמים המוצר נקנה

//   // מפרט גמיש
//   specs: { type: Map, of: String, default: {} },

//   // מדיה
//   images: [{ type: String, default: [] }],
//   video: { type: String, default: "" },   // סרטון מוצר (URL או נתיב מקומי)

//   // דירוג
//   ratings: {
//     sum: { type: Number, default: 0 },
//     avg: { type: Number, default: 0 },     // ממוצע כוכבים (0–5)
//     count: { type: Number, default: 0 },   // כמות מדרגים
//     breakdown: {                           // פיזור דירוגים (כמה נתנו 1–5 כוכבים)
//       1: { type: Number, default: 0 },
//       2: { type: Number, default: 0 },
//       3: { type: Number, default: 0 },
//       4: { type: Number, default: 0 },
//       5: { type: Number, default: 0 },
//     }
//   },

//   // סטטוס מוצר
//   status: { type: String, enum: ["טיוטא", "מפורסם", "מושהה"], default: "טיוטא" },

//   // הנחה
//   discount: {
//     discountType: { type: String, enum: ["percent", "fixed"], required: true }, // אחוז/סכום קבוע
//     discountValue: { type: Number, required: true }, // כמה אחוז או כמה ₪
//     expiresAt: { type: Date }              // מתי ההנחה מסתיימת
//   },


//   // שילוח
//   shipping: {                                   // מידע למשלוח
//     dimensions: { type: String, default: "" },  // מידות האריזה (למשל "30x20x10cm")
//     weight: { type: String, default: "" },  // משקל האריזה (למשל "2kg")
//     from: { type: String, default: "IL" }, // מדינת מקור (ברירת מחדל – ישראל)
//   },

//   // שדות מורשת לתקופת מעבר (אופציונלי)
//   legacyPrice: { type: Number },  // אם יש לך קוד שמצפה ל-number
//   image: { type: String },  // תמונה בודדת למערכות ישנות
// }, { timestamps: true });         // מוסיף createdAt ו־updatedAt אוטומטית


// // יוניק רק אם שני השדות קיימים (sparse)
// productSchema.index({ supplier: 1, sku: 1 }, { unique: true, sparse: true });

// // ✨ Middleware שמחשב את stock הכללי לפי סך כל הווריאציות
// productSchema.pre("save", function (next) {
//   if (this.variations && this.variations.length > 0) {
//     this.stock = this.variations.reduce((sum, v) => sum + (v.stock || 0), 0);
//   }
//   next();
// });

// // ✨ Middleware ליצירת SKU אוטומטי
// productSchema.pre("save", async function (next) {
//   if (this.sku) return next(); // אם כבר יש SKU – לא יוצרים

//   try {
//     const counter = await Counter.findOneAndUpdate(
//       { category: this.category },
//       { $inc: { seq: 1 } }, // מעלה מונה ב-1
//       { new: true, upsert: true } // יוצר אם לא קיים
//     );

//     const brandPart = this.brand ? this.brand.slice(0, 3).toUpperCase() : "GEN";
//     const categoryPart = this.category ? this.category.slice(0, 3).toUpperCase() : "CAT";

//     const numberPart = String(counter.seq).padStart(4, "0"); // 0001, 0002...
//     this.sku = `${brandPart}-${categoryPart}-${numberPart}`;

//     next();
//   } catch (err) {
//     next(err);
//   }
// });


// export const Product = mongoose.model("Product", productSchema);


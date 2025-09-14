// validations/productSchema.js
import { z } from "zod";

// עזר: מוודא מספר שלם ותמיד לא שלילי
const nonNegativeInt = z.number()
  .int("חייב להיות מספר שלם")
  .nonnegative("לא יכול להיות שלילי");

// עזר: כתובות URL לתמונות
const urlStr = z.string().url("כתובת אינה תקינה");

// וריאציה בודדת
const variationSchema = z.object({
  sku: z.string().trim().min(1, "SKU של וריאציה אינו יכול להיות ריק").optional(),
  attributes: z.object({
    color: z.string().trim().optional(),
    size: z.string().trim().optional(),
    storage: z.string().trim().optional(),
  }).partial().default({}),
  price: z.object({
    currency: z.string().trim().default("ILS"),
    amount: z.number({ required_error: "מחיר וריאציה חובה" })
      .positive("מחיר וריאציה חייב להיות חיובי"),
  }),
  stock: z.number().int().min(0).default(0),
  images: z.array(urlStr).default([]),
});

// הנחה
const discountSchema = z.object({
  discountType: z.enum(["percent", "fixed"], { required_error: "סוג הנחה חובה" }),
  discountValue: z.number({ required_error: "ערך הנחה חובה" })
    .positive("ערך הנחה חייב להיות חיובי"),
  expiresAt: z.coerce.date().optional(),
}).partial().refine(
  d => !d.discountType || d.discountValue !== undefined,
  { message: "כשיש סוג הנחה חייבים לספק ערך", path: ["discountValue"] }
);

// סקירה
const overviewSchema = z.object({
  text: z.string().optional(),
  images: z.array(urlStr).optional().default([]),
  videos: z.array(urlStr).optional().default([]),
}).partial().default({});

// שילוח והובלה
const shippingSchema = z.object({
  dimensions: z.string().optional().default(""),
  weight: z.string().optional().default(""),
  from: z.string().optional().default("IL"),
}).partial().default({});

const deliverySchema = z.object({
  requiresDelivery: z.boolean().optional().default(false),
  cost: z.number().min(0, "עלות משלוח לא יכולה להיות שלילית").optional().default(0),
  notes: z.string().optional().default(""),
}).partial().default({});

// סכימת יצירת מוצר
export const createProductSchema = z.object({
  // זיהוי לפי ספק/מוכר/חנות
  supplier: z.string().trim().optional(),
  sellerId: z.string().trim().optional(),
  storeId: z.string().trim().optional(),

  // מידע כללי
  title: z.string({ required_error: "שם מוצר חובה" })
    .trim().min(2, "שם מוצר קצר מדי"),
  titleEn: z.string().trim().optional().default(""),
  description: z.string().optional().default(""),
  brand: z.string().trim().optional().default(""),
  category: z.string().trim().optional().default("אחר"),
  subCategory: z.string().trim().optional().default(""),
  overview: overviewSchema,

  gtin: z.string().trim().optional().default(""),
  sku: z.string().trim().optional(),
  model: z.string().trim().optional().default(""),

  // מחיר בסיסי - חובה
  price: z.object({
    currency: z.string().trim().default("ILS"),
    amount: z.number({ required_error: "מחיר מוצר חובה" })
      .positive("מחיר חייב להיות חיובי"),
  }),
  originalPrice: z.number()
    .positive("מחיר לפני הנחה חייב להיות חיובי")
    .optional()
    .refine((v) => v === undefined || Number.isFinite(v), { message: "ערך לא תקין" }),

  // וריאציות - אופציונלי
  variations: z.array(variationSchema).optional().default([]),

  // מלאי בסיסי - אופציונלי, יחושב גם מהווריאציות בצד המודל
  stock: z.number().int().min(0).optional().default(0),

  // מפרט טכני גמיש - מפת מחרוזות
  specs: z.record(z.string()).optional().default({}),

  // מדיה
  images: z.array(urlStr).optional().default([]),
  video: urlStr.optional().or(z.string().trim().length(0)).optional(),

  // סטטוס ונראות
  status: z.enum(["draft", "published", "suspended"]).optional().default("draft"),
  visibility: z.enum(["public", "private", "restricted"]).optional().default("public"),
  scheduledAt: z.coerce.date().optional(),
  visibleUntil: z.coerce.date().optional(),

  // הנחה
  discount: discountSchema.optional(),

  // אחריות
  warranty: z.string().optional().default("12 חודשים אחריות יבואן רשמי"),

  // שילוח
  shipping: shippingSchema,
  delivery: deliverySchema,

  // שדות מורשת - אופציונלי
  legacyPrice: z.number().positive().optional(),
  image: urlStr.optional().or(z.string().trim().length(0)).optional(),
})
.strict() // חוסם שדות לא מוכרים ב־create
.superRefine((data, ctx) => {
  // אם יש originalPrice - נוודא שהוא לא קטן מהמחיר הנוכחי
  if (typeof data.originalPrice === "number" && data.originalPrice < data.price.amount) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["originalPrice"],
      message: "מחיר לפני הנחה לא יכול להיות נמוך מהמחיר הנוכחי",
    });
  }
  // אם יש וריאציות - נוודא שמחירי הווריאציות חיוביים (כבר נבדק) וש־stock לא שלילי
  // כבר מכוסה בסכימה של וריאציה.
});

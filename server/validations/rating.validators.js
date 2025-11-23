import { z } from "zod";

// עזר: מזהה אובייקט Mongo
export const zObjectId = z.string().regex(/^[0-9a-fA-F]{24}$/, "ObjectId לא תקין");

// מדיה (תמונה/וידאו)
const mediaSchema = z.object({
  kind: z.enum(["image","video"]),
  url: z.string().url(),
  width: z.number().int().nonnegative().nullable().optional(),
  height: z.number().int().nonnegative().nullable().optional(),
  duration: z.number().int().nonnegative().nullable().optional(), // שניות
});

// יצירת דירוג ע״י לקוח
export const createRatingSchema = z.object({
  productId: zObjectId,
  sellerId:  zObjectId,
  orderId:   zObjectId,
  orderItemId: zObjectId,
  variationId: zObjectId.optional().nullable(),
  stars: z.number().int().min(1).max(5),
  text:  z.string().trim().max(800).optional().default(""),
  images: z.array(mediaSchema).max(6).optional().default([]),
  videos: z.array(mediaSchema).max(2).optional().default([]),
  anonymous: z.boolean().optional().default(false),
}).strict();

// עדכון דירוג (למשל טקסט בלבד בתוך חלון עריכה ללקוח)
export const updateRatingSchema = z.object({
  stars: z.number().int().min(1).max(5).optional(),
  text:  z.string().trim().max(800).optional(),
  images: z.array(mediaSchema).max(6).optional(),
  videos: z.array(mediaSchema).max(2).optional(),
  anonymous: z.boolean().optional(),
}).strict();

// יצירת תגובת מוכר – פעם אחת
export const createSellerReplySchema = z.object({
  reply: z.string().trim().min(1, "יש להזין טקסט").max(800),
}).strict();

// עדכון תגובת מוכר – בתוך 24 שעות
export const updateSellerReplySchema = z.object({
  reply: z.string().trim().min(1, "יש להזין טקסט").max(800),
}).strict();

// שינוי חשיפה של תגובת מוכר
export const sellerReplyVisibilitySchema = z.object({
  visible: z.boolean(),
}).strict();

// רשימת דירוגים למוכר – פרמטרי שאילתה
export const listSellerRatingsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(10),
  sort: z.enum(["createdAt","-createdAt","stars","-stars","likesCount","-likesCount"]).default("-createdAt"),
  stars: z.coerce.number().int().min(1).max(5).optional(),
  hasComment: z.coerce.boolean().optional(),      // true = רק עם טקסט
  hasMedia:   z.coerce.boolean().optional(),      // true = רק עם מדיה
  from: z.string().datetime().optional(),         // תאריכים לסינון
  to:   z.string().datetime().optional(),
  productId: zObjectId.optional(),
}).strict();

// שאילתת אנליטיקה/סטטיסטיקות למוכר
export const sellerRatingsStatsQuerySchema = z.object({
  productId: zObjectId.optional(),
  from: z.string().datetime().optional(),
  to:   z.string().datetime().optional(),
}).strict();

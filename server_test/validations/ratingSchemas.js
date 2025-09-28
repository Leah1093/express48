import { z } from "zod";
import { boolParam, objectIdParam, dateParam, paginationParams, sortEnum, objectIdCsvParam } from "./utils.js";

/** -----------------------------------
 * רשימת דירוגים למוכר (GET /seller/ratings)
 * ----------------------------------- */
export const listSellerRatingsQuerySchema = z.object({
  ...paginationParams.shape,
  sort: sortEnum([
    "createdAt", "-createdAt",
    "stars", "-stars",
    "likesCount", "-likesCount"
  ]).default("-createdAt"),
  stars: z.coerce.number().int().min(1).max(5).optional(),
  hasComment: boolParam.optional(),
  hasMedia: boolParam.optional(),
  productId: objectIdParam.optional(),
  from: dateParam.optional(),
  to: dateParam.optional(),
  status: z.enum(["approved","rejected","all"]).default("all")
}).strict();

/** -----------------------------------
 * סטטיסטיקות דירוגים למוכר (GET /seller/ratings/stats)
 * ----------------------------------- */
export const sellerRatingsStatsQuerySchema = z.object({
  productId: objectIdParam.optional(),
  from: dateParam.optional(),
  to: dateParam.optional(),
}).strict();

/** -----------------------------------
 * יצירת תגובת מוכר (POST /seller/ratings/:id/reply)
 * ----------------------------------- */
export const createSellerReplySchema = z.object({
  reply: z.string()
    .trim()
    .min(1, "יש להזין טקסט")
    .max(800, "עד 800 תווים"),
}).strict();

/** -----------------------------------
 * עדכון תגובת מוכר (PATCH /seller/ratings/:id/reply)
 * ----------------------------------- */
export const updateSellerReplySchema = z.object({
  reply: z.string()
    .trim()
    .min(1, "יש להזין טקסט")
    .max(800, "עד 800 תווים"),
}).strict();

/** -----------------------------------
 * שינוי חשיפה של תגובת מוכר (PATCH /seller/ratings/:id/reply/visibility)
 * ----------------------------------- */
export const sellerReplyVisibilitySchema = z.object({
  visible: z.boolean({
    required_error: "יש לציין visible",
    invalid_type_error: "visible חייב להיות boolean",
  }),
}).strict();
export const createRatingSchema = z.object({
  productId: objectIdParam,
  sellerId: objectIdParam,
  orderId: objectIdParam,
  orderItemId: objectIdParam,
  variationId: objectIdParam.optional(),

  stars: z.coerce.number().int().min(1).max(5),
  text: z.string().trim().max(800).optional().default(""),

  images: z.array(z.object({
    kind: z.literal("image"),
    url: z.string().url(),
    width: z.number().int().positive().optional(),
    height: z.number().int().positive().optional(),
  })).optional().default([]),

  videos: z.array(z.object({
    kind: z.literal("video"),
    url: z.string().url(),
    width: z.number().int().positive().optional(),
    height: z.number().int().positive().optional(),
    duration: z.number().positive().optional(),
  })).optional().default([]),

  anonymous: z.boolean().optional().default(false),
}).strict();


const imageItem = z.object({
  kind: z.literal("image"),
  url: z.string().url(),
  width: z.number().int().positive().optional(),
  height: z.number().int().positive().optional(),
});

const videoItem = z.object({
  kind: z.literal("video"),
  url: z.string().url(),
  width: z.number().int().positive().optional(),
  height: z.number().int().positive().optional(),
  duration: z.number().positive().optional(),
});

export const updateRatingSchema = z.object({
  stars: z.coerce.number().int().min(1).max(5).optional(),
  text: z.string().trim().max(800).optional(),
  images: z.array(imageItem).optional(),
  videos: z.array(videoItem).optional(),
  anonymous: z.boolean().optional(),
})
  .refine(
    (b) => b.stars !== undefined || b.text !== undefined || b.images !== undefined || b.videos !== undefined || b.anonymous !== undefined,
    { message: "יש לעדכן לפחות שדה אחד" }
  )
  .strict();

export const listMyRatingsQuerySchema = z.object({
  ...paginationParams.shape, // page,limit עם ברירות מחדל
  sort: sortEnum(["createdAt", "-createdAt", "stars", "-stars"]).default("-createdAt"),
  productId: objectIdParam.optional(),
  hasMedia: boolParam.optional(),
}).strict();

export const getMyRatingParamsSchema = z.object({
  id: objectIdParam, // :id בנתיב
}).strict();

export const ratingIdParamsSchema = z.object({ id: objectIdParam }).strict();

export const setHelpfulVoteSchema = z.object({
  action: z.enum(["like", "dislike", "clear"]), // 'clear' = ביטול הצבעה
}).strict();

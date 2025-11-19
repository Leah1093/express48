import { z } from "zod";

const boolFromAny = z
  .union([z.boolean(), z.string()])
  .optional()
  .transform((v) => {
    if (typeof v === "boolean") return v;
    if (typeof v === "string") return v === "true";
    return true;
  });

export const createCategorySchema = z.object({
  name: z.string().min(2, "שם קטגוריה קצר מדי"),
  slug: z.string().min(2, "slug חובה"),

  // כרגע תמיד שורש, אבל נשאיר אופציונלי ליום שאחרי
  parent: z.string().optional().nullable(),

  order: z
    .union([z.string(), z.number()])
    .optional()
    .transform((v) => (v === undefined ? 0 : Number(v) || 0)),

  isActive: boolFromAny,

  imageUrl: z.string().optional(),
  description: z.string().optional(),

  // כאן זה *רק* URL אם תשלחי. הקובץ עצמו יושב ב-req.file, לא כאן.
  icon: z.string().optional(),
});

// לעדכון – הכל אופציונלי
export const updateCategorySchema = createCategorySchema.partial();

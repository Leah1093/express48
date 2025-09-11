// src/schemas/productSeoSchema.js
import { z } from "zod";

export const productSeoSchema = z.object({
  // slug לא נערך בצד לקוח, אם יגיע מהשרת - נשמור כמחרוזת רשות
  // slug: z.string().min(3).max(100).optional(),
  // metaTitle: z
  //   .string()
  //   .trim()
  //   .max(60, "Meta Title עד 60 תווים")
  //   .optional()
  //   .default(""),
   metaTitle: z.string().trim().max(60, "Meta Title עד 60 תווים").optional().default(""),
  metaDescription: z
    .string()
    .trim()
    .max(160, "Meta Description עד 160 תווים")
    .optional()
    .default(""),
});

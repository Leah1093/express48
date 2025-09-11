import { z } from "zod";

export const productInventorySchema = z.object({
  sku: z.string().trim().optional().default(""),
  stock: z
    .number({ invalid_type_error: "מלאי חייב להיות מספר" })
    .int("המלאי חייב להיות מספר שלם")
    .min(0, "מלאי לא יכול להיות שלילי")
    .default(0),
  // רשות: ריק או 8–14 ספרות
  gtin: z
    .string()
    .trim()
    .default("")
    .refine(
      v => v === "" || (/^\d{8,14}$/.test(v)),
      "GTIN חייב להיות 8–14 ספרות או ריק"
    ),
  // נגזר אוטומטית מהכמות
  inStock: z.boolean().default(false),
});

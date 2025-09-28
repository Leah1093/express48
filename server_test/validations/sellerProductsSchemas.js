import { z } from "zod";

// הערכים לפי המודל שלך: status ∈ draft|published|suspended
export const listQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  sort: z.enum([
    "-updatedAt","updatedAt","title","brand","-price","+price","price",
    "stock","-stock"
  ]).default("-updatedAt"),
  search: z.string().trim().max(120).optional(),
  status: z.enum(["draft","published","suspended"]).optional(),
  category: z.string().trim().optional(),
  brand: z.string().trim().optional(),
  priceMin: z.coerce.number().min(0).optional(),
  priceMax: z.coerce.number().min(0).optional(),
  stockMin: z.coerce.number().min(0).optional(),
  stockMax: z.coerce.number().min(0).optional(),
  updatedFrom: z.coerce.date().optional(),
  updatedTo: z.coerce.date().optional(),
  deleted: z.enum(["active","deleted","all"]).default("active").optional(),
  // אופציונלי: רשימת שדות מותאמת (למשל "_id,title,sku,price.amount")
  fields: z.string().trim().optional()
});

export const idParamSchema = z.object({
  id: z.string().min(8)
});
export const updateStatusSchema = z.object({
  status: z.enum(["draft", "published", "suspended"]),
});
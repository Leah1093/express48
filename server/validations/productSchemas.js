// validation/productSchemas.js
import { z } from "zod";

/* ------------ Helpers ------------ */
const objectId = z.string().regex(/^[a-f\d]{24}$/i, "Invalid id");
const money = z.coerce.number().min(0, "Must be ≥ 0");     // תומך גם במחרוזות מספריות
const intNonNeg = z.coerce.number().int().min(0);

/* ------------ Sub-schemas ------------ */
const imageSchema = z.object({
  url: z.string().url(),
  alt: z.string().optional().default(""),
  isPrimary: z.boolean().optional().default(false),
});

const variantSchema = z.object({
  sku: z.string().trim().optional(),
  barcode: z.string().trim().optional(),
  price: money,
  stock: intNonNeg.default(0),
  attributes: z.record(z.string()).optional(), // למשל {color:'red', size:'M'}
});

/* ------------ Create / Update ------------ */
export const createProductSchema = z
  .object({
    title: z.string().min(2).max(180),
    description: z.string().optional().default(""),

    sku: z.string().optional(),
    barcode: z.string().optional(),

    price: money,
    compareAtPrice: money.optional(),
    currency: z.string().length(3).optional().default("ILS"),

    stock: intNonNeg.optional().default(0),

    categoryId: z.string().optional(),
    attributes: z.record(z.string()).optional(),
    variants: z.array(variantSchema).optional().default([]),
    images: z.array(imageSchema).optional().default([]),

    dimensions: z
      .object({
        length: money.optional(),
        width: money.optional(),
        height: money.optional(),
      })
      .optional(),
    weight: money.optional(),

    seo: z
      .object({
        title: z.string().max(180).optional(),
        description: z.string().max(300).optional(),
      })
      .optional(),
  })
  .superRefine((val, ctx) => {
    if (val.compareAtPrice != null && val.compareAtPrice < val.price) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["compareAtPrice"],
        message: "compareAtPrice must be ≥ price",
      });
    }
  });

export const updateProductSchema = createProductSchema
  .partial()
  .extend({
    status: z.enum(["draft", "pending", "published", "hidden", "archived"]).optional(),
  })
  .superRefine((val, ctx) => {
    if (val.price != null && val.compareAtPrice != null && val.compareAtPrice < val.price) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["compareAtPrice"],
        message: "compareAtPrice must be ≥ price",
      });
    }
  });

/* ------------ List (Seller) ------------ */
export const listQuerySchema = z.object({
  q: z.string().optional(),
  status: z.enum(["draft", "pending", "published", "hidden", "archived"]).optional(),
  categoryId: z.string().optional(),
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
  sort: z
    .enum(["createdAt", "-createdAt", "price", "-price", "title", "-title"])
    .optional()
    .default("-createdAt"),
});

/* ------------ Params / Minor actions ------------ */
// :id
export const idParamsSchema = z.object({ id: objectId });

// :id + :imageKey
export const imageParamsSchema = z.object({
  id: objectId,
  imageKey: z.string().min(1),
});

// Bulk: { ids:[], action:'hide|archive|delete' }
export const bulkActionSchema = z.object({
  ids: z.array(objectId).min(1),
  action: z.enum(["hide", "archive", "delete"]),
});

// Reorder images: { order:['key1','key2',...] }
export const orderImagesSchema = z.object({
  order: z.array(z.string().min(1)).min(1),
});

/* ------------ Admin ------------ */
// body: { action, reason? }
export const adminSetStatusSchema = z.object({
  action: z.enum(["approve", "reject", "hide", "archive"]),
  reason: z.string().max(300).optional(), // אפשר להקשיח ל-required כשaction='reject'
});

// params: /admin/products/:id/status
export const adminIdParamsSchema = z.object({ id: objectId });

/* ------------ (אופציונלי) Storefront Public ------------ */
// אם תרצה לאחד גם לחנות הציבורית במקום קובץ נפרד:
export const listPublicSchema = z.object({
  q: z.string().optional(),
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
});

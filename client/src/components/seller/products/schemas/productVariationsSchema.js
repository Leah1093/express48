import { z } from "zod";

export const priceImpactTypeEnum = z.enum(["none", "addon", "override"]);
export const priceMergeRuleEnum = z.enum(["sum", "max"]);

export const variationAttributeTermSchema = z.object({
  id: z.string(),
  label: z.string().min(1, "מונח חובה"),
  priceType: priceImpactTypeEnum.default("none"),
  price: z.preprocess(
    (v) => (v === "" || v == null || (typeof v === "number" && Number.isNaN(v)) ? undefined : v),
    z.union([z.coerce.number().nonnegative(), z.undefined()])
  ),
  images: z.array(z.string()).default([]),
});

export const variationAttributeSchema = z.object({
  name: z.string().min(1, "שם תכונה חובה").regex(/^[a-zA-Z0-9_-]+$/, "שם באנגלית/slug"),
  displayName: z.string().min(1, "תצוגת תכונה חובה"),
  terms: z.array(variationAttributeTermSchema).min(1, "יש להוסיף לפחות מונח אחד"),
});

export const variationsConfigSchema = z.object({
  priceRule: priceMergeRuleEnum.default("sum"),
  attributes: z.array(variationAttributeSchema).default([]),
});

export const singleVariationSchema = z.object({
  sku: z.string().optional(),
  sellerSku: z.string().optional().default(""),
  gtin: z.string().optional().default(""),
  attributes: z.record(z.string()).default({}),
  price: z
    .object({
      amount: z.coerce.number().optional(), // קולט גם "35" וגם Number{}
      currency: z.string().default("ILS"),
    })
    .optional(),
  discount: z
    .object({
      discountType: z.enum(["percent", "fixed"]).optional(),
      discountValue: z.coerce.number().optional(),
      startsAt: z.string().optional(),
      expiresAt: z.string().optional(),
    })
    .optional(),
  stock: z.coerce.number().int().nonnegative().default(0),
  inStock: z.boolean().default(false),
  images: z.array(z.string()).default([]),
  active: z.boolean().default(true),

  _calculatedPrice: z.coerce.number().optional(),
  _manualOverride: z.coerce.number().optional(),
});

export const productVariationsSchema = z.object({
  variationsConfig: variationsConfigSchema.default({
    priceRule: "sum",
    attributes: [],
  }),
  variations: z.array(singleVariationSchema).default([]),
});

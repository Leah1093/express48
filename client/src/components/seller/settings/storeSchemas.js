// components/store/settings/schemas/storeSchemas.js
import { z } from "zod";

export const mediaUrlSchema = z
  .string()
  .trim()
  .optional()
  .transform((s) => s ?? "")
  .refine(
    (s) =>
      s === "" ||
      /^https?:\/\//i.test(s) ||
      s.startsWith("/") ||
      s.startsWith("blob:") ||
      s.startsWith("data:"),
    "URL לא תקין"
  );

export const mediaSoftSchema = z.object({
  kind: z.enum(["image", "video"]).optional(),
  url: mediaUrlSchema,
  alt: z.string().optional(),
  // ניתן לצרף קובץ זמני להעלאה (לא עובר ולידציית zod)
}).passthrough();

export const supportSchema = z
  .object({
    email: z
      .string()
      .email("אימייל לא תקין")
      .transform((s) => s.toLowerCase().trim())
      .optional()
      .or(z.literal("")),
    phone: z.string().trim().optional(),
    whatsapp: z.string().trim().optional(),
    hours: z.string().trim().optional(),
    note: z.string().trim().optional(),
  })
  .optional()
  .default({});

export const appearanceSchema = z
  .object({
    storeNamePosition: z
      .enum(["header", "over-banner", "hidden"])
      .optional()
      .default("header"),
    productsPerPage: z.coerce.number().int().min(1).max(1000).optional().default(24),
    hideEmail: z.boolean().optional().default(false),
    hidePhone: z.boolean().optional().default(false),
    hideAddress: z.boolean().optional().default(false),
    hideAbout: z.boolean().optional().default(false),
  })
  .optional()
  .default({});

export const policiesSchema = z
  .object({
    about: z.string().optional(),
    shipping: z.string().optional(),
    returns: z.string().optional(),
    privacy: z.string().optional(),
    terms: z.string().optional(),
  })
  .optional()
  .default({});

// סכימת ה־"כללי" (כולל תיאור וטקסטים) – שליחת טופס כללי
export const generalFormSchema = z.object({
  name: z.string().min(2, "שם חנות קצר מדי").trim(),
  contactEmail: z
    .string()
    .email("אימייל לא תקין")
    .transform((s) => s.toLowerCase().trim()),
  phone: z.string().trim().optional(),
  description: z.string().optional(),
  support: supportSchema,
  appearance: appearanceSchema,
  policies: policiesSchema,
});

// סכימת מדיה – שליחת מדיה בנפרד
export const mediaFormSchema = z.object({
  bannerTypeStore: z.enum(["static", "video", "slider"]).optional().default("static"),
  bannerTypeList: z.enum(["static", "video"]).optional().default("static"),
  logo: mediaSoftSchema.optional(),
  storeBanner: mediaSoftSchema.optional(),
  mobileBanner: mediaSoftSchema.optional(),
  listBanner: mediaSoftSchema.optional(),
  storeSlider: z.array(mediaSoftSchema).optional().default([]),
});

// סכימת סלוג – שליחה נפרדת
export const slugFormSchema = z.object({
  slug: z.string().optional(),
  status: z.string().optional(),
  slugChanged: z.boolean().optional(),
});

export const buildDefaultValues = (initial = {}) => ({
  // כללי
  name: initial.name || "",
  contactEmail: initial.contactEmail || "",
  phone: initial.phone || "",
  description: initial.description || "",
  support: {
    email: initial?.support?.email || "",
    phone: initial?.support?.phone || "",
    whatsapp: initial?.support?.whatsapp || "",
    hours: initial?.support?.hours || "",
    note: initial?.support?.note || "",
  },
  appearance: {
    storeNamePosition: initial?.appearance?.storeNamePosition || "header",
    productsPerPage: initial?.appearance?.productsPerPage ?? 24,
    hideEmail: !!initial?.appearance?.hideEmail,
    hidePhone: !!initial?.appearance?.hidePhone,
    hideAddress: !!initial?.appearance?.hideAddress,
    hideAbout: !!initial?.appearance?.hideAbout,
  },
  policies: {
    about: initial?.policies?.about || "",
    shipping: initial?.policies?.shipping || "",
    returns: initial?.policies?.returns || "",
    privacy: initial?.policies?.privacy || "",
    terms: initial?.policies?.terms || "",
  },
  // מדיה
  bannerTypeStore: initial.bannerTypeStore || "static",
  bannerTypeList: initial.bannerTypeList || "static",
  logo: initial.logo || { kind: "image", url: "", alt: "" },
  storeBanner: initial.storeBanner || { kind: "image", url: "", alt: "" },
  mobileBanner: initial.mobileBanner || { kind: "image", url: "", alt: "" },
  listBanner: initial.listBanner || { kind: "image", url: "", alt: "" },
  storeSlider: Array.isArray(initial.storeSlider) ? initial.storeSlider : [],
  // סלוג
  slug: initial.slug || "",
  status: initial.status || "draft",
  slugChanged: !!initial.slugChanged,
});

// validations/seller.schema.js
import { z } from "zod";

export const objectIdStr = z.string().regex(/^[0-9a-fA-F]{24}$/, "ObjectId לא תקין");

const toCategoriesArray = (v) =>
  (Array.isArray(v) ? v : String(v ?? "").split(","))
    .map(s => String(s).trim())
    .filter(Boolean);

// יצירה ע"י משתמש מחובר (userId יוזן בשרת, לא מהלקוח)
export const createSellerSchema = z.object({
  userId: objectIdStr,
  companyName: z.string().min(2, "שם חברה קצר מדי").trim(),
  fullName:    z.string().min(2, "שם מלא קצר מדי").trim(),
  email:       z.string().email("אימייל לא תקין").transform(e => e.toLowerCase().trim()),
  roleTitle:   z.string().trim().optional().default(""),
  phone:       z.string().trim().optional().default(""),
  categories:  z.union([z.string(), z.array(z.string())]).optional().transform(toCategoriesArray),
  notes:       z.string().trim().optional().default(""),
  status:      z.enum(["new","approved","rejected","suspended"]).optional().default("new"),
});

// עדכון חופשי (מוכר או אדמין)
export const updateSellerSchema = z.object({
  companyName: z.string().min(2).trim().optional(),
  fullName:    z.string().min(2).trim().optional(),
  email:       z.string().email().transform(e => e.toLowerCase().trim()).optional(),
  roleTitle:   z.string().trim().optional(),
  phone:       z.string().trim().optional(),
  categories:  z.union([z.string(), z.array(z.string())])
                 .optional()
                 .transform(v => v === undefined ? undefined : toCategoriesArray(v)),
  notes:       z.string().trim().optional(),
  status:      z.enum(["new","approved","rejected","suspended"]).optional(),
});

// שינוי סטטוס ע"י אדמין
export const adminUpdateStatusSchema = z.object({
  status: z.enum(["new","approved","rejected","suspended"]),
  note:   z.string().max(500).optional().default(""),
});

export const idParamsSchema = z.object({ id: objectIdStr });

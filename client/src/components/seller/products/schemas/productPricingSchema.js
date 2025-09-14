// src/schemas/productPricingSchema.js
import { z } from "zod";

export const productPricingSchema = z.object({
  currency: z.string().default("ILS"),
  price: z.object({
    amount: z
      .number({ invalid_type_error: "המחיר חייב להיות מספר" })
      .min(0, "מחיר לא יכול להיות שלילי"),
  }),
  discount: z
    .object({
      discountType: z.enum(["percent", "fixed"]).optional().or(z.literal("")),
      discountValue: z.number().optional(),
      // שדות datetime-local יגיעו כמחרוזות; אפשר לשמור כמחרוזת או להמיר בת־האב
      startsAt: z.string().optional(), // "" או "YYYY-MM-DDTHH:mm"
      expiresAt: z.string().optional(),
    })
    .optional()
})
.superRefine((data, ctx) => {
  const d = data.discount || {};
  const type = d.discountType || "";
  const val = d.discountValue;

  // אם נבחר סוג הנחה - חייב ערך
  if (type && (val === undefined || val === null || Number.isNaN(val))) {
    ctx.addIssue({
      path: ["discount", "discountValue"],
      code: z.ZodIssueCode.custom,
      message: "חסר ערך להנחה",
    });
  }

  if (type === "percent" && typeof val === "number") {
    if (val < 0 || val > 100) {
      ctx.addIssue({
        path: ["discount", "discountValue"],
        code: z.ZodIssueCode.custom,
        message: "אחוז ההנחה חייב להיות בין 0 ל־100",
      });
    }
  }
  if (type === "fixed" && typeof val === "number") {
    if (val < 0) {
      ctx.addIssue({
        path: ["discount", "discountValue"],
        code: z.ZodIssueCode.custom,
        message: "ערך הנחה כספי לא יכול להיות שלילי",
      });
    }
  }

  // בדיקת סדר תאריכים אם שניהם קיימים
  if (d.startsAt && d.expiresAt) {
    const a = new Date(d.startsAt);
    const b = new Date(d.expiresAt);
    if (!Number.isNaN(a.valueOf()) && !Number.isNaN(b.valueOf()) && a > b) {
      ctx.addIssue({
        path: ["discount", "expiresAt"],
        code: z.ZodIssueCode.custom,
        message: "תפוגה חייבת להיות אחרי תחילת ההנחה",
      });
    }
  }
});

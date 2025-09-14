// src/schemas/productVisibilitySchema.js
import { z } from "zod";

export const productVisibilitySchema = z.object({
  visibility: z.enum(["public", "private", "restricted"]).default("public"),
  // מגיע כ-maybe string מתוך input datetime-local; אפשר להשאיר כמחרוזת ולהמיר בבקאנד
  scheduledAt: z.string().optional().or(z.literal("")),
  visibleUntil: z.string().optional().or(z.literal("")),
}).superRefine((data, ctx) => {
  if (data.scheduledAt && data.visibleUntil) {
    const a = new Date(data.scheduledAt);
    const b = new Date(data.visibleUntil);
    if (!Number.isNaN(a.valueOf()) && !Number.isNaN(b.valueOf()) && a > b) {
      ctx.addIssue({
        path: ["visibleUntil"],
        code: z.ZodIssueCode.custom,
        message: "סיום ההצגה חייב להיות אחרי מועד ההתחלה",
      });
    }
  }
});

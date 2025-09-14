import { z } from "zod";

export const productShippingSchema = z.object({
  shipping: z.object({
    dimensions: z.object({
      length: z.coerce.number().min(0, "אורך חייב להיות 0 ומעלה").default(0),
      width: z.coerce.number().min(0, "רוחב חייב להיות 0 ומעלה").default(0),
      height: z.coerce.number().min(0, "גובה חייב להיות 0 ומעלה").default(0),
    }),
    weightKg: z.coerce.number().min(0, "משקל חייב להיות 0 ומעלה").default(0),

    from: z.string().default("IL"),
  }),
  delivery: z.object({
    requiresDelivery: z.boolean().default(false),
    cost: z.number().min(0, "מחיר לא יכול להיות שלילי").default(0),
    notes: z.string().trim().default(""),
  }),
});

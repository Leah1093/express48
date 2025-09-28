import { z } from "zod";

export const createOrderSchema = z.object({
  addressId: z.string().min(1, "נדרשת כתובת"),
  notes: z.string().optional(),
  items: z
    .array(
      z.object({
        productId: z.string().min(1, "נדרש מזהה מוצר"),
        quantity: z.number().min(1, "כמות חייבת להיות לפחות 1"),
        price: z.number().min(0, "מחיר חייב להיות חיובי"),
      })
    )
    .min(1, "חייב להיות לפחות מוצר אחד"),
});

export const updateStatusSchema = z.object({
  status: z.enum([
    "pending",
    "approved",
    "canceled",
    "returned",
    "completed",
  ]),
});

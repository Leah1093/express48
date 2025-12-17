import { z } from "zod";

// סכמת כתובת לאורחים
const guestAddressSchema = z.object({
  fullName: z.string().min(1, "נדרש שם מלא"),
  phone: z.string().min(1, "נדרש מספר טלפון"),
  email: z.string().email("כתובת אימייל לא תקינה").optional(),
  country: z.string().default("IL"),
  city: z.string().min(1, "נדרש שם עיר"),
  street: z.string().min(1, "נדרש שם רחוב"),
  houseNumber: z.string().optional(),
  apartment: z.string().optional(),
  zip: z.string().optional(),
  notes: z.string().optional(),
});

export const createOrderSchema = z.object({
  addressId: z.string().optional(), // אופציונלי - אם לא מסופק, צריך guestAddress
  guestAddress: guestAddressSchema.optional(), // אופציונלי - אם לא מסופק, צריך addressId
  notes: z.string().optional(),
  couponCode: z.string().optional(),
  items: z
    .array(
      z.object({
        productId: z.string().min(1, "נדרש מזהה מוצר"),
        quantity: z.number().min(1, "כמות חייבת להיות לפחות 1"),
        price: z.number().min(0, "מחיר חייב להיות חיובי"),
        priceAfterDiscount: z.number().min(0).optional(),
        variationId: z.string().nullable().optional(),
        variationAttributes: z.record(z.string(), z.string()).optional(),
      })
    )
    .min(1, "חייב להיות לפחות מוצר אחד"),
}).refine(
  (data) => data.addressId || data.guestAddress,
  {
    message: "נדרש addressId או guestAddress",
    path: ["addressId"],
  }
);

export const updateStatusSchema = z.object({
  status: z.enum([
    "pending",
    "approved",
    "canceled",
    "returned",
    "completed",
    "paid",
  ]),
});

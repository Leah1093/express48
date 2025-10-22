import { z } from 'zod';

export const startPaymentSchema = z.object({
  orderId: z.string().min(1),
  items: z.array(z.object({
    productId: z.string().min(1),
    quantity: z.coerce.number().int().positive().default(1),
    price: z.coerce.number().optional(),
    priceAfterDiscount: z.coerce.number().optional(),
  })).nonempty('No items selected'),
});

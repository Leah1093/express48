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

export const tranzilaWebhookSchema = z.object({

  transaction_index: z.coerce.number().int().positive(),
  orderid: z.string().min(1),
  sum: z.coerce.number().positive().optional(),
  currency: z.union([z.literal('1'), z.coerce.number()]).optional(),
  response: z.string().optional(), 
}).transform((v) => ({
  ...v,
  // normalize
  currency: String(v.currency ?? ''),
}));

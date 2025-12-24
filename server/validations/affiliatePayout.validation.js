import { z } from "zod";

export const affiliateRequestPayoutSchema = z.object({
  amount: z.number().positive().optional(), // לא שולחים => משוך הכל
  method: z.enum(["bank", "paypal", "bit", "paybox"]),
  payoutDetails: z.any().optional(),
});

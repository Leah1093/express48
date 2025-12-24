import { z } from "zod";

export const affiliateAcceptTermsSchema = z.object({
  version: z.string().min(1),
  confirmations: z.object({
    programExplanation: z.literal(true),
    noSelfPurchase: z.literal(true),
    noMisleadingAds: z.literal(true),
    privacyRules: z.literal(true),
    payoutPolicy: z.literal(true),
  }),
});

export const affiliateTrackClickSchema = z.object({
  code: z.string().min(2).max(32),
  path: z.string().min(1).max(512),
  referrer: z.string().max(1024).optional().nullable(),
  productId: z.string().optional().nullable(),
  meta: z.any().optional(),
});

// apply לא צריך payload - רק פעולה
export const affiliateApplySchema = z.object({});

import { z } from "zod";

export const updateStoreStatusSchema = z.object({
  status: z.enum(["draft", "active", "suspended"]),
  note: z.string().max(500).optional().default(""),
});


export const slugParamsSchema = z.object({
  slug: z
    .string()
    .min(2)
    .max(200)
    .regex(/^[a-z0-9-]+$/i, "invalid slug"),
});
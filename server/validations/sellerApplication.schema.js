import { z } from "zod";

export const objectIdStr = z.string().regex(/^[0-9a-fA-F]{24}$/,"ObjectId לא תקין");

export const updateApplicationStatusSchema = z.object({
  status: z.enum(["approved","rejected","suspended","pending"]),
  note: z.string().max(500).optional().default(""),
});

export const idParamsSchema = z.object({
  id: objectIdStr,
});

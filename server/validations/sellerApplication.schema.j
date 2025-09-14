import { z } from "zod";

export const sellerApplySchema = z.object({
  companyName: z.string().min(2, "שם חברה קצר מדי"),
  fullName:    z.string().min(2, "שם מלא קצר מדי"),
  email:       z.string().email("אימייל לא תקין"),
  position:    z.string().optional().default(""),
  phone:       z.string().optional().default(""),
  categories:  z.string().optional().default(""),
  notes:       z.string().optional().default(""),
});

// סינון לפי סטטוס בליסטה אדמינית
export const listApplicationsQuerySchema = z.object({
  status: z.enum(["pending", "approved", "rejected"]).optional(),
});

import { z } from "zod";

export const updateProfileSchema = z.object({
  username: z.string().min(2, "שם חייב להיות לפחות 2 תווים"),
  email: z.string().email("דוא\"ל לא תקין"),
  phone: z.string().min(7, "טלפון לא תקין").max(15),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(6),
  newPassword: z.string().min(6),
  confirmPassword: z.string().min(6),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "הסיסמאות החדשות אינן תואמות",
  path: ["confirmPassword"],
});

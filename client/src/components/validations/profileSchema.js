import { z } from "zod";

export const profileSchema = z.object({
  username: z.string().min(2, "יש להזין שם משתמש"),
  email: z.string().email("כתובת מייל לא תקינה"),
  phone: z.string().min(9, "מספר טלפון לא תקין").optional().or(z.literal("")),
});

export const passwordSchema = z.object({
  currentPassword: z.string().min(6, "יש להזין סיסמה נוכחית"),
  newPassword: z.string().min(6, "סיסמה חדשה חייבת לפחות 6 תווים"),
  confirmPassword: z.string().min(6, "יש לאשר את הסיסמה החדשה"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "הסיסמאות אינן תואמות",
  path: ["confirmPassword"],
});

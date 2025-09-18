import { z } from "zod";

export const registerSchema = z.object({
  username: z.string().min(2, "שם משתמש נדרש").optional(),
  email: z.string().email("אימייל לא תקין"),
  phone: z
    .string()
    .min(9, "מספר קצר מדי")
    .max(15, "מספר ארוך מדי")
    .regex(/^\d+$/, "הטלפון חייב להכיל ספרות בלבד").optional(),
  password: z.string().min(6, "סיסמה חייבת לפחות 6 תווים"),
});

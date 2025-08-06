import { z } from 'zod';

export const passwordSchema = z.object({
  currentPassword: z.string().min(6),
  newPassword: z.string()
    .min(6, "הסיסמה חייבת לכלול לפחות 6 תווים")
    // .regex(/[A-Z]/, "חובה לפחות אות גדולה אחת")
    // .regex(/[0-9]/, "חובה לפחות ספרה אחת")
});

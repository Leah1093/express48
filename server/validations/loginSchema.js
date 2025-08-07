// validations/loginSchema.js
import { z } from "zod";

export const loginSchema = z.object({
  email: z.string({ required_error: "חובה להזין מייל" }).email("כתובת מייל לא תקינה"),
  password: z.string({ required_error: "חובה להזין סיסמה" }).min(6, "סיסמה חייבת לפחות 6 תווים"),
});

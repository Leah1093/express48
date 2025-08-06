import rateLimit from 'express-rate-limit';

// לימיט עבור בקשת איפוס סיסמה (reset password)
export const resetPasswordLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 דקות
  max: 3, // עד 3 ניסיונות בפרק הזמן
  message: {
    error: 'בוצעו יותר מדי ניסיונות לאיפוס סיסמה. נא להמתין 15 דקות ולנסות שוב.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// לימיט עבור שינוי סיסמה (change password)
export const changePasswordLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 דקות
  max: 5, // עד 5 ניסיונות בפרק הזמן
  message: {
    error: 'בוצעו יותר מדי ניסיונות לשנות סיסמה. נא לנסות שוב בעוד מספר דקות.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

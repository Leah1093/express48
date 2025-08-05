import rateLimit from 'express-rate-limit';

export const contactLimiter = rateLimit({
  windowMs: 60 * 1000, // דקה
  max: 3,              // עד 3 בקשות לדקה
  message: {
    error: 'השליחה נחסמה זמנית. נא להמתין ולנסות שוב.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

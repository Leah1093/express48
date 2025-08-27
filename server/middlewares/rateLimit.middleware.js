// middlewares/rateLimit.middleware.js
import rateLimit from "express-rate-limit";

/**
 * חשוב: שימי ב-app.js
 *   app.set('trust proxy', 1);
 * אחרת req.ip לא יהיה אמין מאחורי פרוקסי (NGINX/Heroku/Render וכו')
 */

/** ✦ handler אחיד לכל החסימות */
const json429 = (req, res) => {
  return res.status(429).json({
    ok: false,
    error: "Too many requests. Please slow down.",
    retryAfterSec: Number(res.getHeader("Retry-After") || 60),
  });
};

/** ✦ פונקציות מפתח לזיהוי */
const keyByAuthOrIp = (req) => {
  if (req.user?.userId) return `user:${req.user.userId}`;
  if (req.seller?._id) return `seller:${req.seller._id}`;
  return `ip:${req.ip}`;
};

const keyByEmailOrIp = (req) => {
  const email = (req.body?.email || req.query?.email || "")
    .toString()
    .trim()
    .toLowerCase();
  return email ? `email:${email}|ip:${req.ip}` : `ip:${req.ip}`;
};

/* ========= רשת ביטחון לכל ה-API ========= */
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 דק'
  max: 600,                 // 600 בקשות לחלון
  standardHeaders: true,
  legacyHeaders: false,
  handler: json429,
  keyGenerator: keyByAuthOrIp,
  // דוגמה לדילוג על מסלולים מסוימים:
  // skip: (req) => req.path.startsWith("/admin") || req.path === "/health",
});

/* ========= דירוגים ========= */
export const createRatingLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // שעה
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  handler: json429,
  keyGenerator: keyByAuthOrIp,
});

export const helpfulLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 דק'
  max: 40,
  standardHeaders: true,
  legacyHeaders: false,
  handler: json429,
  keyGenerator: keyByAuthOrIp,
});

export const sellerReplyLimiter = rateLimit({
  windowMs: 30 * 60 * 1000, // 30 דק'
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  handler: json429,
  keyGenerator: keyByAuthOrIp,
});

/* ========= סיסמאות ========= */
export const resetPasswordLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 דק'
  max: 3,                   // עד 3 בקשות איפוס לכל email+IP
  standardHeaders: true,
  legacyHeaders: false,
  handler: json429,
  keyGenerator: keyByEmailOrIp,
});

export const changePasswordLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 דק'
  max: 5,                   // עד 5 ניסיונות שינוי סיסמה למשתמש
  standardHeaders: true,
  legacyHeaders: false,
  handler: json429,
  keyGenerator: keyByAuthOrIp,
});
export const editRatingLimiter = rateLimit({
  windowMs: 30 * 60 * 1000, // 30 דקות
  max: 30,                  // עד 30 עדכונים בחלון למשתמש
  standardHeaders: true,
  legacyHeaders: false,
  handler:json429,
  // משתמש מחובר → לפי userId; אחרת IP
  keyGenerator: (req) => (req.user?.userId ? `user:${req.user.userId}` : `ip:${req.ip}`),
});
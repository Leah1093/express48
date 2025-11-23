import rateLimit, { ipKeyGenerator } from "express-rate-limit";

const json429 = (req, res) => {
    return res.status(429).json({
        ok: false,
        error: "Too many requests. Please slow down.",
        retryAfterSec: Number(res.getHeader("Retry-After") || 60),
    });
};

const keyByAuthOrIp = (req, res) => {
    if (req.user?.userId) return `user:${req.user.userId}`;
    if (req.seller?._id) return `seller:${req.seller._id}`;

    return `ip:${ipKeyGenerator(req, res)}`;
};

export const keyByEmailOrIp = (req, res) => {
    const email = (req.body?.email || req.query?.email || "")
        .toString()
        .trim()
        .toLowerCase();
    const ipKey = ipKeyGenerator(req, res); // ← אחיד ל-IPv6
    return email ? `email:${email}|ip:${ipKey}` : `ip:${ipKey}`;
};

/* ========= רשת ביטחון לכל ה-API ========= */
export const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 דק'
    max: 600,                 // 600 בקשות לחלון
    standardHeaders: true,
    legacyHeaders: false,
    handler: json429,
    keyGenerator: keyByAuthOrIp,
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
    max: 30,
    standardHeaders: true,
    legacyHeaders: false,
    handler: json429,
    // משתמש מחובר → לפי userId; אחרת IP מאוחד ל-IPv6
    keyGenerator: (req, res) =>
        req.user?.userId ? `user:${req.user.userId}` : `ip:${ipKeyGenerator(req, res)}`,
});

//כניסה 
export const loginLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 דקות
  max: 5,                   // עד 5 ניסיונות login
  standardHeaders: true,
  legacyHeaders: false,
  handler: json429,
  keyGenerator: keyByEmailOrIp, // נועל לפי email+IP
});


export const refreshLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 דקות
  max: 10,                 // עד 10 refresh לכל IP
  standardHeaders: true,
  legacyHeaders: false,
  handler: json429,
  keyGenerator: keyByAuthOrIp, // אם מחובר → לפי userId, אחרת לפי IP
});

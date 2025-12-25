import { cookieNames } from "../utils/cookies.js";
import { verifyAccessToken } from "../utils/jwt.js";
import { Store } from "../models/store.js";

/**
 * Middleware שמנסה authMiddleware קודם (אם יש טוקן),
 * ואם אין טוקן - ממשיך כאורח (authOptional)
 * 
 * אם יש טוקן - משתמש ב-authMiddleware (מ-middlewares/auth.js)
 * אם אין טוקן - ממשיך כאורח (req.user = null)
 */
export async function authOptionalWithAuth(req, res, next) {
  try {
    // בדיקה אם יש טוקן (כמו ב-authMiddleware)
    const token = req.cookies?.[cookieNames.access];
    
    // אם אין טוקן - ממשיכים כאורח
    if (!token) {
      req.user = null;
      req.auth = null;
      return next();
    }

    // אם יש טוקן - נשתמש בלוגיקה של authMiddleware
    const payload = verifyAccessToken(token);
    if (!payload?.sub) {
      // טוקן לא תקין - ממשיכים כאורח
      req.user = null;
      req.auth = null;
      return next();
    }

    // בסיס זהות (כמו ב-authMiddleware)
    req.auth = {
      sub: payload.sub,
      sid: payload.sid,
      role: payload.role || null,
      roles: payload.roles || (payload.role ? [payload.role] : []),
      sellerId: payload.sellerId || null,
      storeId: null,
    };

    req.user = {
      userId: payload.sub,
      role: payload.role || null,
      roles: payload.roles || (payload.role ? [payload.role] : []),
      sellerId: payload.sellerId || null,
      storeId: null,
    };

    const isSeller = req.auth.roles.includes("seller") || req.auth.role === "seller";

    if (isSeller) {
      if (!req.auth.sellerId) {
        // מוכר ללא sellerId - ממשיכים כאורח (לא שגיאה)
        req.user = null;
        req.auth = null;
        return next();
      }
      const store = await Store.findOne({ sellerId: req.auth.sellerId }).select("_id").lean();
      if (!store?._id) {
        // מוכר ללא חנות - ממשיכים כאורח (לא שגיאה)
        req.user = null;
        req.auth = null;
        return next();
      }

      req.auth.storeId = String(store._id);
      req.user.storeId = String(store._id);
    }

    return next();
  } catch (e) {
    // טוקן לא תקין או שגיאה - ממשיכים כאורח
    req.user = null;
    req.auth = null;
    return next();
  }
}


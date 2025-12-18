import jwt from "jsonwebtoken";
import { Seller } from "../models/seller.js";

/**
 * מזהה משתמש אם יש טוקן (Bearer או cookie), אחרת משאיר אורח.
 * משלים sellerId אם למשתמש יש תפקיד מוכר אך הטוקן לא כולל sellerId.
 */
export async function authOptional(req, _res, next) {
  try {
    console.log("token")

    const bearer = req.headers.authorization?.startsWith("Bearer ")
      ? req.headers.authorization.slice(7)
      : null;
    const cookieToken = req.cookies?.token || req.cookies?.accessToken || null;
    const token = bearer || cookieToken;
console.log(token)
    if (!token) { req.user = null; return next(); }

    const p = jwt.verify(token, process.env.JWT_SECRET);

    // בניית אובייקט גמיש
    req.user = {
      userId: p.userId || p.id || p._id || null,
      email:  p.email || null,
      role:   p.role  || "user",
      roles:  p.roles || [],
      sellerId: p.sellerId || null,
      ...p,
    };
console.log( req.user)

    // השלמת sellerId אם חסר ולמשתמש יש role של מוכר
    const isSeller = req.user.role === "seller" || (req.user.roles || []).includes("seller");
    if (isSeller && !req.user.sellerId && req.user.userId) {
      const s = await Seller.findOne({ userId: req.user.userId }).select("_id").lean();
      if (s) req.user.sellerId = s._id.toString();
    }

    return next();
  } catch {
    // טוקן לא תקף – ממשיכים כאורח
    req.user = null;
    return next();
  }
}

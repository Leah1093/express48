// import jwt from "jsonwebtoken";

// export function authCookieMiddleware(req, res, next) {
//   const token = req.cookies.token;
//   console.log("hi coo")
//   if (!token) {
//     return res.status(401).json({ error: "Missing authentication token" });
//   }

//   try {
//     console.log("token")

//     const decoded = jwt.verify(token, process.env.JWT_SECRET);
//     req.user = { userId: decoded.userId , role: decoded.role, roles: decoded.roles};
//     console.log("Decoded token:", decoded);
//     console.log("Decoded token:", decoded.role);

//     next();
//   } catch (err) {
//     return res.status(403).json({ error: "Invalid or expired token" });
//   }
// }



// middlewares/authCookie.middleware.js
import jwt from "jsonwebtoken";
import { Seller } from "../models/seller.js"; // למילוי sellerId אם חסר

export async function authCookieMiddleware(req, res, next) {
  try {
    console.log("authCookieMiddleware")

    // קחי טוקן מקוקי או מ-Authorization: Bearer
    const cookieToken = req.cookies?.token;
    const header = req.headers.authorization || "";
    const bearerToken = header.startsWith("Bearer ") ? header.slice(7) : null;
    const token = cookieToken || bearerToken;

    if (!token) return res.status(401).json({ error: "Missing authentication token" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // העברה מסודרת ל-request
    req.user = {
      userId: decoded.userId,
      role: decoded.role,
      roles: decoded.roles || [],
      sellerId: decoded.sellerId || null,
    };
    req.auth = req.user; // אופציונלי, לשמירה על תאימות

    // מילוי sellerId אם חסר אבל המשתמש מוגדר כמוכר
    const isSellerRole = req.user.role === "seller" || (req.user.roles || []).includes("seller");
    if (!req.user.sellerId && isSellerRole) {
      const s = await Seller.findOne({ userId: req.user.userId }).select("_id");
      if (s) req.user.sellerId = s._id.toString();
    }
    console.log("user", req.user,isSellerRole)

    return next();
  } catch (err) {
    return res.status(403).json({ error: "Invalid or expired token" });
  }
}

// middlewares/auth.js
import { cookieNames } from "../utils/cookies.js";
import { verifyAccessToken } from "../utils/jwt.js";
import { Store } from "../models/store.js"; // ודא שהשם/נתיב המודל תואם אצלך

export async function authMiddleware(req, res, next) {
    try {
        // console.log("authMiddleware") // ❌ מבוטל - רעש מיותר

        const token = req.cookies?.[cookieNames.access];
        // console.log("token",token) // ❌ מבוטל - רעש מיותר

        if (!token) return res.status(401).json({ error: "לא מחובר" });

        const payload = verifyAccessToken(token);
        if (!payload?.sub) return res.status(401).json({ error: "טוקן לא תקין או פג" });

        // בסיס זהות
        req.auth = {
            sub: payload.sub,//USERID לפי כל העולם
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
                return res.status(403).json({ error: "חסר שיוך מוכר למשתמש" });
            }
//לבדוק אם צריך
            const store = await Store.findOne({ sellerId: req.auth.sellerId }).select("_id").lean();
            if (!store?._id) {
                return res.status(403).json({ error: "לא מוגדרת חנות למוכר" });
            }

            req.auth.storeId = String(store._id);
            req.user.storeId = String(store._id);
        }

        // console.log("user", req.user) // ❌ מבוטל - רעש מיותר
        // console.log("auth", req.auth) // ❌ מבוטל - רעש מיותר
        next();
    } catch (e) {
        return res.status(401).json({ error: "טוקן לא תקין או פג" });
    }
}
//אם להשאיר את זה או להשתמש במה שהשתמשנו עד היום
// export function requireRole(...rolesInput) {
//     const allowed = Array.isArray(rolesInput[0]) ? rolesInput[0] : rolesInput;

//     return (req, res, next) => {
//         const userRoles =
//             req.auth?.roles && req.auth.roles.length
//                 ? req.auth.roles
//                 : req.auth?.role
//                     ? [req.auth.role]
//                     : [];

//         if (allowed.some((r) => userRoles.includes(r))) return next();
//         return res.status(403).json({ error: "אין הרשאה" });
//     };
// }



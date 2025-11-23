import { cookieNames } from "../utils/cookies.js";
import { verifyAccessToken } from "../utils/jwt.js";
import { Store } from "../models/store.js"; 

export async function authMiddleware(req, res, next) {
    try {

        const token = req.cookies?.[cookieNames.access];
        if (!token) return res.status(401).json({ error: "לא מחובר" });

        const payload = verifyAccessToken(token);
        if (!payload?.sub) return res.status(401).json({ error: "טוקן לא תקין או פג" });

        // בסיס זהות
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
                return res.status(403).json({ error: "חסר שיוך מוכר למשתמש" });
            }
            const store = await Store.findOne({ sellerId: req.auth.sellerId }).select("_id").lean();
            if (!store?._id) {
                return res.status(403).json({ error: "לא מוגדרת חנות למוכר" });
            }

            req.auth.storeId = String(store._id);
            req.user.storeId = String(store._id);
        }

        next();
    } catch (e) {
        return res.status(401).json({ error: "טוקן לא תקין או פג" });
    }
}



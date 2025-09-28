// middlewares/ensureSellerProfile.js
import Seller from "../models/seller.js";

export async function ensureSellerProfile(req, res, next) {
    try {
        const uid = req.user?.userId || req.user?.id || req.user?._id || req.auth?.id;
        if (!uid) return res.status(401).json({ message: "Unauthorized" });

        // מושך את המוכר
        let seller = await Seller.findOne({ userId: uid });

        // אם לא קיים – אפשר ליצור אוטומטית ריק (אם זה המודל העסקי שלך)
        if (!seller) {
            const isAdmin = req.user?.role === "admin" || (req.user?.roles || []).includes("admin");
            if (isAdmin) return res.status(404).json({ message: "Seller profile not found" });
            // רק למוכר רגיל ניצור:
            seller = await Seller.create({ userId: uid });
        }

        // אימות סטטוס: מאושר + גישת פאנל
        const approved = seller?.status === "approved"; // אם אין לך שדה כזה כרגע – הסירי את הבדיקה
        const panelAccess = seller?.panelAccess !== false; // ברירת מחדל true אם לא קיים

        // אם אין אישור/גישה – אפשר לחסום, אבל לאפשר לאדמין לעבור
        const isAdmin = !!req.access?.isAdmin;
        if ((!approved || !panelAccess) && !isAdmin) {
            return res.status(403).json({ message: "Seller profile not approved or no panel access" });
        }

        req.seller = seller;
        return next();
    } catch (err) {
        return next(err);
    }
}

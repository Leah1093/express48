import Seller from "../models/seller.js";

export async function ensureSellerProfile(req, res, next) {
    try {
        const uid = req.user?.userId || req.user?.id || req.user?._id || req.auth?.id;
        if (!uid) return res.status(401).json({ message: "Unauthorized" });

        let seller = await Seller.findOne({ userId: uid });

        if (!seller) {
            const isAdmin = req.user?.role === "admin" || (req.user?.roles || []).includes("admin");
            if (isAdmin) return res.status(404).json({ message: "Seller profile not found" });
            seller = await Seller.create({ userId: uid });
        }

        const approved = seller?.status === "approved"; 
        const panelAccess = seller?.panelAccess !== false; 

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

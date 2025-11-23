import { User } from "../models/user.js";

export async function requireSellerRole(req, res, next) {
  try {
    const uid = req.user?.userId || req.user?.id || req.user?._id || req.auth?.id;
    if (!uid) return res.status(401).json({ message: "Unauthorized" });
    console.log("user id seller", uid)
    // אם ה-auth כבר שם role/roles/isSeller ב-req.user – נשתמש בזה
    let { role, roles } = req.user || {};

    if (role === undefined && roles === undefined) {
      const user = await User.findById(uid).select("role roles");
      if (!user) return res.status(401).json({ message: "Unauthorized" });
      role = user.role;
      roles = user.roles;

    }

    const isAdmin = role === "admin" || (Array.isArray(roles) && roles.includes("admin"));
    const isSellerRole = role === "seller" || (Array.isArray(roles) && roles.includes("seller"));
    console.log("is seller?", isSellerRole)
    console.log("is admin?", isAdmin)
    if (!isSellerRole && !isAdmin) {
      return res.status(403).json({ message: "Access denied – sellers only" });
    }
    console.log("is requireSellerRole!!!👍")

    req.access = { ...(req.access || {}), isAdmin, isSellerRole };
    return next();
  } catch (err) {
    return next(err);
  }
}

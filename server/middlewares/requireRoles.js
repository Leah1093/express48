// middlewares/requireRoles.js
export function requireRoles(...allowed) {
  return (req, res, next) => {
    console.log("❤️❤️❤️❤️",req.user)
    const role  = req.user?.role;
    const roles = req.user?.roles || [];
    const has = (r) => r === role || roles.includes(r);
    if (allowed.some(has)) return next();
    return res.status(403).json({ message: "Access denied" });
  };
}

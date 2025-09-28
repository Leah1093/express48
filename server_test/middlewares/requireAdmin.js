// middlewares/requireAdmin.js
export const requireAdmin = (req, _res, next) => {
  const role = req.user?.role;
  const roles = req.user?.roles || [];
  if (role === "admin" || roles.includes("admin")) return next();
  next(new Error("Forbidden"));
};

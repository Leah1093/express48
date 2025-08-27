import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";

export default function RoleGate({
  allow = [],
  requireSellerApproved = false,
  mode = "render",
  redirectTo = "/account",
  children,
}) {
  const { user, initialized } = useSelector((s) => s.user) || {};
  const role = user?.role;
  const roles = Array.isArray(user?.roles) ? user.roles : [];
  const sellerStatus = user?.sellerStatus;

  // חכי שהאפליקציה תסיים לבדוק /me
  if (!initialized) {
    return null; // או ספינר קטן אם בא לך
  }

  const hasRole = allow.length === 0
    ? true
    : allow.includes(role) || allow.some((r) => roles.includes(r));

  const hasStatus = !requireSellerApproved || sellerStatus === "approved";
  const ok = hasRole && hasStatus;

  if (ok) return children;
  if (mode === "route") return <Navigate to={redirectTo} replace />;
  return null;
}

import { FaUserCircle } from "react-icons/fa";
import { useSelector, useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { handleLogout } from "../authentication/logoutHandler";
const UserMenu = () => {
  const user = useSelector((state) => state.user.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const displayName = user?.name || user?.email || "התחברות";
  const canManageSeller = user && ["seller", "admin"].includes(user.role);

  return (
    <div className="relative group text-right inline-block">
      <div
        key={displayName}
        className="flex items-center gap-2 font-semibold hover:text-orange-500 cursor-pointer">
        <FaUserCircle className="text-xl" />
        <span>{displayName}</span>
        <span className="text-xs">▾</span>
      </div>

      <div className="absolute right-0 mt-2 w-44 bg-white border rounded-md shadow-lg text-sm opacity-0 invisible group-hover:visible group-hover:opacity-100 transition-all duration-200 z-50">
        {user ? (
          <>
            <HoverLink to="/account" label="חשבון" />
            <HoverLink to="/account/profile" label="פרופיל" />
            <HoverLink to="/account/orders" label="הזמנות" />
            <HoverLink to="/account/favorites" label="מועדפים" />
            <HoverLink to="/account/addresses" label="כתובות" />
            <HoverLink to="/account/downloads" label="הורדות" />

            {canManageSeller && (<HoverLink to="/seller" label="ניהול מוכר" className="font-semibold text-blue-600" />)}

            <button
              onClick={() => handleLogout(dispatch, navigate)} // ✅ שימוש חדש
              className="block w-full text-right px-4 py-2 text-red-600 hover:bg-gray-100" >
              התנתקות
            </button>
          </>
        ) : (
          <>
            <HoverLink to="/login" label="כניסה" />
            <HoverLink to="/register" label="הרשמה" />
          </>
        )}
      </div>
    </div>
  );
};

const HoverLink = ({ to, label, className = "" }) => (
  <Link
    to={to}
    className={`block px-4 py-2 text-gray-800 hover:bg-gray-100 ${className}`}
  >
    {label}
  </Link>
);

export default UserMenu;

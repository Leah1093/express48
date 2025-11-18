import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  FaUser,
  FaMapMarkerAlt,
  FaDownload,
  FaClipboardList,
  FaHeart,
  FaSignOutAlt,
} from "react-icons/fa";
import { useDispatch } from "react-redux";
import { handleLogout } from "../authentication/logoutHandler";

export default function AccountDashboard() {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const onLogout = () => handleLogout(dispatch, navigate);

  const items = [
    { key: "orders",     icon: <FaClipboardList />, label: "הזמנות",     to: "/account/orders" },
    { key: "downloads",  icon: <FaDownload />,      label: "הורדות",     to: "/account/downloads" },
    { key: "addresses",  icon: <FaMapMarkerAlt />,  label: "כתובות",     to: "/account/addresses" },
    { key: "favorites",  icon: <FaHeart />,         label: "מועדפים",    to: "/account/favorites" },
    { key: "profile",    icon: <FaUser />,          label: "הפרופיל שלי", to: "/account/profile" },
    { key: "logout",     icon: <FaSignOutAlt />,    label: "יציאה",      onClick: onLogout },
  ];

  const isActive = (item) => {
    // ברירת מחדל: "הפרופיל שלי" לחוץ כשאנחנו ב-/account או /account/profile
    if (item.key === "profile") {
      return (
        location.pathname === "/account" ||
        location.pathname.startsWith("/account/profile")
      );
    }
    if (!item.to) return false;
    return location.pathname.startsWith(item.to);
  };

  const baseClasses =
    "w-40 h-[59px] px-2 rounded-[12px] flex items-center justify-center gap-2 " +
    "text-center text-[16px] font-semibold leading-[1.2] tracking-[-0.011em] " +
    "transition-colors duration-150";

  return (
    <div dir="rtl" className="w-full bg-white border-b border-[#EDEDED]">
      <div className="max-w-7xl mx-auto flex flex-wrap gap-3 justify-between items-start px-4 md:px-10 py-3">
        {items.map((item) => {
          const active = isActive(item);
          const stateClasses = active
            ? "bg-[#FFF7F2] text-[#141414] shadow-sm"
            : "bg-transparent text-[#666666] hover:bg-[#F5F5F5]";

          // טאב רגיל שמוביל לראוט קיים
          if (item.to) {
            return (
              <Link
                key={item.key}
                to={item.to}
                className={`${baseClasses} ${stateClasses}`}
              >
                {item.icon && <span className="text-lg">{item.icon}</span>}
                <span>{item.label}</span>
              </Link>
            );
          }

          // טאב "יציאה" – כפתור שמריץ onLogout
          return (
            <button
              key={item.key}
              type="button"
              onClick={item.onClick}
              className={`${baseClasses} ${stateClasses}`}
            >
              {item.icon && <span className="text-lg">{item.icon}</span>}
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* בהמשך נכתוב כאן את שאר התוכן של העמוד לפי מה שתרצי */}
    </div>
  );
}

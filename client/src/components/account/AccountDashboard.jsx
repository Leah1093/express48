import { Link, useNavigate } from "react-router-dom";
import {
  FaUser, FaMapMarkerAlt, FaDownload, FaClipboardList,
  FaHeart, FaSignOutAlt, FaStore
} from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import { handleLogout } from "../authentication/logoutHandler";
import { selectRole } from "../../redux/slices/userSelectors";
// רכיב עזר: פריט כקישור או כפתור
function NavItem({ item, className }) {
  if (item.to) {
    return (
      <Link to={item.to} className={className}>
        {item.icon && <span className="mr-2 inline-block align-middle">{item.icon}</span>}
        <span className="align-middle">{item.label}</span>
      </Link>
    );
  }
  return (
    <button onClick={item.onClick} className={className}>
      {item.icon && <span className="mr-2 inline-block align-middle">{item.icon}</span>}
      <span className="align-middle">{item.label}</span>
    </button>
  );
}

export default function AccountDashboard() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user   = useSelector((s) => s.user.user);
  const role   = useSelector(selectRole);

  const onLogout = () => handleLogout(dispatch, navigate);

  const items = [
    { key: "seller-dashboard", icon: <FaStore />,         label: "ניהול מוכר",   to: "/seller/dashboard", roles: ["seller", "admin"] },
    { key: "orders",           icon: <FaClipboardList />, label: "הזמנות",       to: "/account/orders" },
    { key: "downloads",        icon: <FaDownload />,      label: "הורדות",       to: "/account/downloads" },
    { key: "addresses",        icon: <FaMapMarkerAlt />,  label: "כתובות",       to: "/account/addresses" },
    { key: "favorites",        icon: <FaHeart />,         label: "מועדפים",      to: "/account/favorites" },
    { key: "profile",          icon: <FaUser />,          label: "פרטי חשבון",   to: "/account/profile" },
    { key: "logout",           icon: <FaSignOutAlt />,    label: "יציאה",        onClick: onLogout },
  ];

  const visibleItems = items.filter(it => !it.roles || it.roles.includes(role));

  return (
    <div className="flex flex-col lg:flex-row-reverse p-4 gap-4 max-w-7xl mx-auto" >
      <aside className="w-full lg:w-1/4 bg-gray-100 p-4 rounded shadow">
        <h2 className="text-xl font-semibold mb-3">החשבון שלי</h2>
        <ul className="space-y-3 text-right">
          <li className="bg-white p-2 rounded font-bold">לוח בקרה</li>
          {visibleItems.map((item) => (
            <li key={item.key}>
              <NavItem
                item={item}
                className="block hover:underline w-full text-right"
              />
            </li>
          ))}
        </ul>
      </aside>

      <main className="w-full lg:w-3/4">
        <h1 className="text-2xl font-bold text-right">
          <button onClick={onLogout} className="cursor-pointer text-blue-600 underline ml-2">
            (התנתק)
          </button>
          שלום {user?.username || user?.email || "משתמש"}
        </h1>
        <p className="text-gray-600 mt-2 text-right">
          בלוח הבקרה של החשבון שלך ניתן לראות את ההזמנות האחרונות...
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 mt-6">
          {visibleItems.map((item) =>
            item.to ? (
              <Link key={item.key} to={item.to}>
                <div className="border p-6 rounded hover:bg-gray-50 text-center shadow flex flex-col items-center gap-2 cursor-pointer">
                  <div className="text-3xl text-gray-600">{item.icon}</div>
                  <div className="text-lg font-medium">{item.label}</div>
                </div>
              </Link>
            ) : (
              <div
                key={item.key}
                onClick={item.onClick}
                className="border p-6 rounded hover:bg-gray-50 text-center shadow flex flex-col items-center gap-2 cursor-pointer"
              >
                <div className="text-3xl text-gray-600">{item.icon}</div>
                <div className="text-lg font-medium">{item.label}</div>
              </div>
            )
          )}
        </div>
      </main>
    </div>
  );
}

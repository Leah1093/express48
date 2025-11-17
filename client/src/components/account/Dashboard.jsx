// import { Link, useNavigate, Outlet } from "react-router-dom";
// import { FaUser, FaMapMarkerAlt, FaDownload, FaClipboardList, FaHeart, FaSignOutAlt, FaStore, } from "react-icons/fa";
// import { useDispatch, useSelector } from "react-redux";
// import { handleLogout } from "../authentication/logoutHandler";


// const AccountDashboard = () => {
//   const navigate = useNavigate();

//   const dispatch = useDispatch();

//   const user = useSelector((state) => state.user.user);

//   const onLogout = () => handleLogout(dispatch, navigate);

//   // תנאי תפקידים לניהול מוכר
//   const canManageSeller =
//     !!user && ["seller", "admin"].includes(user.role);

//   const items = [
//     // ניהול מוכר – ייכנס לרשימה רק אם מותר
//     ...(canManageSeller
//       ? [
//         {
//           key: "seller-dashboard",
//           icon: <FaStore />,
//           label: "ניהול מוכר",
//           to: "/seller/dashboard",
//         },
//       ]
//       : []),
//     { key: "orders", icon: <FaClipboardList />, label: "הזמנות", to: "/account/orders" },
//     { key: "downloads", icon: <FaDownload />, label: "הורדות", to: "/account/downloads" },
//     { key: "addresses", icon: <FaMapMarkerAlt />, label: "כתובות", to: "/account/addresses" },
//     { key: "favorites", icon: <FaHeart />, label: "מועדפים", to: "/account/favorites" },
//     { key: "profile", icon: <FaUser />, label: "פרטי חשבון", to: "/account/profile" },
//     { key: "logout", icon: <FaSignOutAlt />, label: "יציאה", onClick: onLogout },
//   ];

//   return (
//     <div className="flex flex-col lg:flex-row-reverse p-4 gap-4 max-w-7xl mx-auto">
//       {/* Sidebar */}
//       <aside className="w-full lg:w-1/4 bg-gray-100 p-4 rounded shadow">
//         <h2 className="text-xl font-semibold mb-4">החשבון שלי</h2>
//         <ul className="space-y-3 text-right">
//           <li className="bg-white p-2 rounded font-bold">לוח בקרה</li>

//           {items.map((item) =>
//             item.to ? (
//               <li key={item.key}>
//                 <Link to={item.to} className="block hover:underline">
//                   {/* לא חייב להציג אייקון בסיידבר, אבל אפשר: */}
//                   {/* <span className="inline-block ml-2 align-middle">{item.icon}</span> */}
//                   {item.label}
//                 </Link>
//               </li>
//             ) : (
//               <li key={item.key}>
//                 <button onClick={item.onClick} className="text-right w-full hover:underline">
//                   {item.label}
//                 </button>
//               </li>
//             )
//           )}
//         </ul>
//       </aside>

//       {/* Main */}
//       <main className="w-full lg:w-3/4">
//         <h1 className="text-2xl font-bold text-right">
//           <button onClick={onLogout} className="cursor-pointer text-blue-600 underline ml-2">
//             (התנתק)
//           </button>
//           שלום {user?.username || user?.email || "משתמש"}
//         </h1>
//         <p className="text-gray-600 mt-2 text-right">
//           בלוח הבקרה של החשבון שלך ניתן לראות את ההזמנות האחרונות...
//         </p>

//         <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 mt-6">
//           {items.map((item) =>
//             item.to ? (
//               <Link key={item.key} to={item.to}>
//                 <div className="border p-6 rounded hover:bg-gray-50 text-center shadow flex flex-col items-center gap-2 cursor-pointer">
//                   <div className="text-3xl text-gray-600">{item.icon}</div>
//                   <div className="text-lg font-medium">{item.label}</div>
//                 </div>
//               </Link>
//             ) : (
//               <div
//                 key={item.key}
//                 onClick={item.onClick}
//                 className="border p-6 rounded hover:bg-gray-50 text-center shadow flex flex-col items-center gap-2 cursor-pointer"
//               >
//                 <div className="text-3xl text-gray-600">{item.icon}</div>
//                 <div className="text-lg font-medium">{item.label}</div>
//               </div>
//             )
//           )}
//         </div>
//       </main>

//       <Outlet />
//     </div>
//   );
// };

// export default AccountDashboard;
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

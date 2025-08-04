// AccountDashboard.tsx
import { Link } from "react-router-dom";
import {
  FaUser,
  FaMapMarkerAlt,
  FaDownload,
  FaClipboardList,
  FaHeart,
  FaSignOutAlt,
} from "react-icons/fa";

const items = [
  { icon: <FaClipboardList />, label: "הזמנות", to: "/account/orders" },
  { icon: <FaDownload />, label: "הורדות", to: "/account/downloads" },
  { icon: <FaMapMarkerAlt />, label: "כתובות", to: "/account/addresses" },
  { icon: <FaSignOutAlt />, label: "יציאה", to: "/logout" },
  { icon: <FaHeart />, label: "מועדפים", to: "/account/favorites" },
  { icon: <FaUser />, label: "פרטי חשבון", to: "/account/profile" },
];

export default function AccountDashboard() {
  return (
    <div className="flex flex-col lg:flex-row-reverse p-4 gap-4 max-w-7xl mx-auto">
      {/* Sidebar */}
      <aside className="w-full lg:w-1/4 bg-gray-100 p-4 rounded shadow">
        <h2 className="text-xl font-semibold mb-4">החשבון שלי</h2>
        <ul className="space-y-3 text-right">
          <li className="bg-white p-2 rounded font-bold">לוח בקרה</li>
          {items.map((item, index) => (
            <li key={index}>
              <Link to={item.to} className="block hover:underline">
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </aside>

      {/* Main */}
      <main className="w-full lg:w-3/4">
        <h1 className="text-2xl font-bold text-right">
            {/*לשנות לשם האמיתי של הלקוח */}
          שלום שמחה (<Link to="/logout" className="text-blue-600">התנתק</Link>)
        </h1>
        <p className="text-gray-600 mt-2 text-right">
          בלוח הבקרה של החשבון שלך ניתן לראות את ההזמנות האחרונות...
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 mt-6">
          {items.map((item, index) => (
            <Link key={index} to={item.to}>
              <div className="border p-6 rounded hover:bg-gray-50 text-center shadow flex flex-col items-center gap-2 cursor-pointer">
                <div className="text-3xl text-gray-600">{item.icon}</div>
                <div className="text-lg font-medium">{item.label}</div>
              </div>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}

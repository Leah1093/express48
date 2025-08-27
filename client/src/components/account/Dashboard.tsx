import { Link, useNavigate } from "react-router-dom";
import {
  FaUser,
  FaMapMarkerAlt,
  FaDownload,
  FaClipboardList,
  FaHeart,
  FaSignOutAlt,
  FaStore,
} from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import { handleLogout } from "../authentication/logoutHandler";
import RoleGate from "../auth/RoleGate";
const AccountDashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((state: any) => state.user.user);

  const onLogout = () => {
    handleLogout(dispatch, navigate);
  };

  const items = [
    {
      condition: (
        <RoleGate  allow={["seller","admin"]}>
          <Link to="/seller/dashboard" className="block hover:underline">
            <FaStore className="inline-block mr-2" /> ניהול מוכר
          </Link>
        </RoleGate>
      ),
    },
    { icon: <FaClipboardList />, label: "הזמנות", to: "/account/orders" },
    { icon: <FaDownload />, label: "הורדות", to: "/account/downloads" },
    { icon: <FaMapMarkerAlt />, label: "כתובות", to: "/account/addresses" },
    { icon: <FaHeart />, label: "מועדפים", to: "/account/favorites" },
    { icon: <FaUser />, label: "פרטי חשבון", to: "/account/profile" },
    { icon: <FaSignOutAlt />, label: "יציאה", onClick: onLogout },
  ];

  return (
    <div className="flex flex-col lg:flex-row-reverse p-4 gap-4 max-w-7xl mx-auto">
      <aside className="w-full lg:w-1/4 bg-gray-100 p-4 rounded shadow">
        <h2 className="text-xl font-semibold mb-4">החשבון שלי</h2>
        <ul className="space-y-3 text-right">
          <li className="bg-white p-2 rounded font-bold">לוח בקרה</li>
          {items.map((item, index) =>
            item.condition ? (
              <li key={index}>{item.condition}</li>
            ) : item.to ? (
              <li key={index}>
                <Link to={item.to} className="block hover:underline">
                  {item.label}
                </Link>
              </li>
            ) : (
              <li key={index}>
                <button onClick={item.onClick} className="text-right w-full hover:underline">
                  {item.label}
                </button>
              </li>
            )
          )}
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
          {items.map((item, index) =>
            item.condition ? (
              <RoleGate key={index} roles={["seller"]}>
                <Link to="/seller/dashboard">
                  <div className="border p-6 rounded hover:bg-gray-50 text-center shadow flex flex-col items-center gap-2 cursor-pointer">
                    <div className="text-3xl text-gray-600">
                      <FaStore />
                    </div>
                    <div className="text-lg font-medium">ניהול מוכר</div>
                  </div>
                </Link>
              </RoleGate>
            ) : item.to ? (
              <Link key={index} to={item.to}>
                <div className="border p-6 rounded hover:bg-gray-50 text-center shadow flex flex-col items-center gap-2 cursor-pointer">
                  <div className="text-3xl text-gray-600">{item.icon}</div>
                  <div className="text-lg font-medium">{item.label}</div>
                </div>
              </Link>
            ) : (
              <div
                key={index}
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
};

export default AccountDashboard;

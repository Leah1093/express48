import { Link, NavLink } from "react-router-dom";

const navItems = [
  { label: "אודות", path: "/about" },
  { label: "שאלות ותשובות", path: "/faq" },
  { label: "שירות לקוחות", path: "/support" },
  { label: "רב מכר", path: "/bestsellers" },
  { label: "קופונים", path: "/coupons" },
  { label: "דרושים", path: "/careers" },
  { label: "מדריכי קניה", path: "/guides" },
];

const MainNav=()=> {
  return (
    <nav dir="rtl" className="flex justify-center gap-8 py-4 bg-white shadow text-sm font-medium">
      {navItems.map((item) => (
        <NavLink
          key={item.path}
          to={item.path}
          className={({ isActive }) =>
            isActive
              ? "text-blue-600 border-b-2 border-blue-600 pb-1"
              : "text-gray-700 hover:text-blue-500 border-b-2 border-transparent pb-1"
          }
        >
          {item.label}
        </NavLink>
      ))}
    </nav>
  );
}
export default MainNav

import { NavLink } from "react-router-dom";
import {
  Home, Package, ShoppingCart, Settings, BarChart3, MessageSquare, ChevronLeft
} from "lucide-react";

const items = [
  { to: "/seller", icon: Home, label: "בית" },
  { to: "/seller/products", icon: Package, label: "מוצרים" },
  { to: "/seller/orders", icon: ShoppingCart, label: "הזמנות" },
  { to: "/seller/reviews", icon: MessageSquare, label: "Reviews" },
  { to: "/seller/reports", icon: BarChart3, label: "דוחות" },
  { to: "/seller/settings", icon: Settings, label: "הגדרות" },
];

export default function SellerSidebar({ open, onClose }) {
  return (
    <>
      {/* Overlay למובייל */}
      <div
        className={`fixed inset-0 bg-black/30 z-40 md:hidden ${open ? "" : "hidden"}`}
        onClick={onClose}
      />

      <aside
        className={`fixed z-50 md:static top-14 md:top-0 bottom-0 md:h-[calc(100vh-0px)]
                    w-72 shrink-0 bg-slate-900 text-slate-100
                    transition-transform md:translate-x-0
                    ${open ? "translate-x-0" : "-translate-x-full md:translate-x-0"}`}
      >
        <div className="h-14 hidden md:flex items-center justify-between px-4 border-b border-slate-800">
          <div className="font-semibold">לוח מוכר</div>
          <button onClick={onClose} className="p-1 rounded hover:bg-slate-800">
            <ChevronLeft size={18} />
          </button>
        </div>

        <nav className="px-2 py-3 space-y-1">
          {items.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === "/seller"}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-lg
                 ${isActive ? "bg-slate-800 text-white" : "text-slate-200 hover:bg-slate-800/60"}`
              }
              onClick={onClose}
            >
              <Icon size={18} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>
      </aside>
    </>
  );
}


import { NavLink } from "react-router-dom";

export default function CartNav() {
  return (
    <div className="bg-[#0E3556] text-white">
      <div className="mx-auto max-w-7xl px-4 py-6">
        <nav className="flex items-center gap-3 text-lg">
          <NavLink
            to="/cart"
            className={({ isActive }) =>
              isActive
                ? "font-bold underline decoration-white/60 underline-offset-4"
                : "opacity-90 hover:opacity-100"
            }
          >
            עגלת קניות
          </NavLink>
          <span className="opacity-70">←</span>
          <NavLink
            to="/checkout"
            className={({ isActive }) =>
              isActive
                ? "font-bold underline decoration-white/60 underline-offset-4"
                : "opacity-90 hover:opacity-100"
            }
          >
            לקופה
          </NavLink>
          <span className="opacity-70">←</span>
          <NavLink
            to="/payment"
            className={({ isActive }) =>
              isActive
                ? "font-bold underline decoration-white/60 underline-offset-4"
                : "opacity-90 hover:opacity-100"
            }
          >
            עמוד תשלום
          </NavLink>
          <span className="opacity-70">←</span>

          <NavLink
            to="/order/success"
            className={({ isActive }) =>
              isActive
                ? "font-bold underline decoration-white/60 underline-offset-4"
                : "opacity-90 hover:opacity-100"
            }
          >
            ההזמנה הושלמה
          </NavLink>
        </nav>
      </div>
    </div>
  );
}


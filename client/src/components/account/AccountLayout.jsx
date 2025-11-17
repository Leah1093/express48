import { Link, Outlet, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";

export default function AccountLayout() {
  const location = useLocation();

  // כמו בעמוד הכתובות
  const user = useSelector((state) => state.user?.user);
  const userName = user?.username || user?.name || user?.email || "משתמש";

  const items = [
    { key: "profile",   label: "הפרופיל שלי",    to: "/account/profile" },
    { key: "orders",    label: "ההזמנות שלי",   to: "/account/orders" },
    { key: "favorites", label: "המועדפים שלי",  to: "/account/favorites" },
    { key: "addresses", label: "ספר כתובות",    to: "/account/addresses" },
    // { key: "payments",  label: "אפשרויות תשלום", to: "/account/payments" },
    { key: "customerService", label: "שירות לקוחות", to: "/account/customerService" },
  ];

  const isActive = (item) => {
    if (item.key === "profile") {
      return (
        location.pathname === "/account" ||
        location.pathname.startsWith("/account/profile")
      );
    }
    return location.pathname.startsWith(item.to);
  };

  const baseClasses =
    "min-w-[140px] h-[52px] px-3 rounded-[12px] " +
    "flex items-center justify-center " +
    "text-center text-[14px] md:text-[16px] font-semibold leading-[1.2] tracking-[-0.011em] " +
    "transition-colors duration-150 whitespace-nowrap";

  return (
    <div dir="rtl" className="w-full bg-white min-h-screen">
      {/* ברכה במובייל בלבד */}
      <div className="max-w-7xl mx-auto px-4 md:px-10 pt-4 pb-2 md:hidden">
        <p className="text-xl font-bold text-right">
          {userName},
        </p>
        <p className="text-sm text-right text-[#666666] mt-1">
          איזה כיף שבאת!
        </p>
      </div>

      {/* שורת הטאבים – רק בדסקטופ/טאבלט (md ומעלה) */}
      <div className="w-full border-b border-[#EDEDED] hidden md:block">
        <div className="max-w-7xl mx-auto px-4 md:px-10 pt-3">
          <nav
            className="
              flex w-full flex-nowrap items-end gap-2
              overflow-x-auto md:overflow-visible
            "
          >
            {items.map((item) => {
              const active = isActive(item);
              const stateClasses = active
                ? "bg-[#FFF7F2] text-[#141414] shadow-sm"
                : "bg-transparent text-[#666666] hover:bg-[#F5F5F5]";

              return (
                <Link
                  key={item.key}
                  to={item.to}
                  className={`flex-1 basis-0 ${baseClasses} ${stateClasses}`}
                >
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* התוכן של העמוד מתחת (גם במובייל וגם בדסקטופ) */}
      <div className="max-w-7xl mx-auto px-4 md:px-10 py-6">
        <Outlet />
      </div>
    </div>
  );
}

import { Menu, LogOut } from "lucide-react";
import { Link } from "react-router-dom";

export default function SellerTopbar({ onToggleSidebar }) {
  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur border-b">
      <div className="max-w-7xl mx-auto px-4 md:px-6 h-14 flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="md:hidden p-2 rounded hover:bg-slate-100"
          aria-label="פתח תפריט"
        ><Menu size={20} /></button>

        <Link to="/store/:slug" className="font-bold text-slate-800">
          My Store
        </Link>

        <div className="ms-auto flex items-center gap-3">
          {/* מקום לחיפוש/התראות בהמשך */}
          <Link
            to="/logout"
            className="flex items-center gap-2 text-slate-600 hover:text-slate-900"
            title="התנתק"
          >
            <LogOut size={18} />
            <span className="hidden sm:inline">התנתק</span>
          </Link>
        </div>
      </div>
    </header>
  );
}

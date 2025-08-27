import { useState } from "react";
import SellerTopbar from "./SellerTopbar.jsx";
import { Outlet } from "react-router-dom";
import SellerSidebar from "./SellerSidebar.jsx";
export default function SellerLayout() {
  const [open, setOpen] = useState(false); // למובייל

  return (
    <div className="min-h-screen bg-slate-100">
      {/* Topbar */}
      <SellerTopbar onToggleSidebar={() => setOpen(prev => !prev)} />

      <div className="flex">
        {/* Sidebar */}
        <SellerSidebar open={open} onClose={() => setOpen(prev => !prev)} />

        {/* Main */}
        <main className="flex-1 p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
//הכל
import { Outlet } from "react-router-dom";
import CartNav from "./CartNav"; // 👈 זה ה־Nav שלך

export default function CartLayout() {
  return (
    <div dir="rtl" className="min-h-screen bg-gray-50">
      {/* הסרגל שתמיד מוצג */}
      <CartNav />  

      {/* כאן יופיע התוכן של הדף הספציפי */}
      <Outlet />
    </div>
  );
}

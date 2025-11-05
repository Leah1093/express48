// // pages/seller/SellerDashboard.jsx
// import { useEffect, useState } from "react";
// import axios from "axios";

// import SellerSidebar from "./SellerSidebar";
// import SellerHeader from "./SellerHeader";
// import SellerProfileForm from "./SellerProfileForm";
// import SellerLogoUpload from "./ellerLogoUpload";
// import SellerProductsPage from "./SellerProductsPage"; // ← חדש

// export default function SellerDashboard() {
//   const [seller, setSeller] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [active, setActive] = useState("profile"); // "profile" | "products"

//   const load = async () => {
//     try {
//       setLoading(true);
//       const res = await axios.get("https://api.express48.com/seller-profile/me", { withCredentials: true });
//       setSeller(res.data?.seller || res.data);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => { load(); }, []);

//   return (
//     <div className="min-h-screen bg-gray-50">
//       <SellerHeader seller={seller} />
//       <div className="mx-auto grid max-w-7xl grid-cols-1 gap-6 px-4 py-6 md:grid-cols-[16rem_1fr]">
//         <SellerSidebar active={active} onSelect={setActive} />
//         <main className="space-y-6">
//           {loading && <div className="h-40 rounded-2xl bg-gray-100 animate-pulse" />}

//           {!loading && active === "profile" && (
//             <>
//               <div className="rounded-3xl border bg-white p-5">
//                 <div className="mb-4 flex items-center justify-between">
//                   <h3 className="text-base font-semibold">כרטיס ביקור</h3>
//                   <SellerLogoUpload onUploaded={setSeller} />
//                 </div>
//                 <div className="flex items-start gap-6">
//                   <div className="h-24 w-24 overflow-hidden rounded-2xl border bg-white">
//                     {seller?.logoUrl ? (
//                       <img src={`https://api.express48.com${seller.logoUrl}`} alt="logo" className="h-full w-full object-cover" />
//                     ) : (
//                       <div className="grid h-full w-full place-items-center text-xs text-gray-400">NO LOGO</div>
//                     )}
//                   </div>
//                   <div className="space-y-2 text-sm text-gray-700">
//                     <div><b>שם עסק:</b> {seller?.businessName || "—"}</div>
//                     <div><b>אימייל:</b> {seller?.email || "—"}</div>
//                     <div><b>טלפון:</b> {seller?.phone || "—"}</div>
//                   </div>
//                 </div>
//               </div>

//               <div className="rounded-3xl border bg-white p-5">
//                 <h3 className="mb-4 text-base font-semibold">עריכת פרופיל</h3>
//                 <SellerProfileForm initial={seller} onSaved={setSeller} />
//               </div>
//             </>
//           )}

//           {!loading && active === "products" && (
//             <div className="rounded-3xl border bg-white p-5">
//               <SellerProductsPage />
//             </div>
//           )}
//         </main>
//       </div>
//     </div>
//   );
// }



export default function SellerDashboard() {
  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-l from-slate-900 to-slate-700 text-white p-6 rounded-xl shadow">
        <div className="text-lg font-semibold mb-1">ברוכים הבאים ללוח המוכרים</div>
        <div className="text-sm opacity-80">כאן תראו סיכומי מכירות, הזמנות אחרונות ועוד</div>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow p-4">כרטיס סטטיסטיקה 1</div>
        <div className="bg-white rounded-xl shadow p-4">כרטיס סטטיסטיקה 2</div>
        <div className="bg-white rounded-xl shadow p-4">כרטיס סטטיסטיקה 3</div>
        <div className="bg-white rounded-xl shadow p-4">כרטיס סטטיסטיקה 4</div>
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-white rounded-xl shadow p-4">גרף (נוסיף Recharts)</div>
        <div className="bg-white rounded-xl shadow p-4">טבלת הזמנות אחרונות</div>
      </div>
    </div>
  );
}
//בית
// // pages/storefront/StorefrontProduct.jsx
// import { useEffect, useState } from "react";
// import axios from "axios";
// import { useParams, Link } from "react-router-dom";

// export default function StorefrontProduct() {
//   const { idOrSlug } = useParams();
//   const api = axios.create({
//     baseURL: "https://api.express48.com",
//     withCredentials: true,
//     timeout: 15000,
//   });

//   const [p, setP] = useState(null);
//   const [busy, setBusy] = useState(false);
//   const [msg, setMsg] = useState("");

//   useEffect(() => {
//     (async () => {
//       try {
//         setBusy(true);
//         const { data } = await api.get(`/products/${idOrSlug}`);
//         setP(data);
//         setMsg("");
//       } catch (e) {
//         setMsg(e?.response?.data?.message || "מוצר לא נמצא");
//       } finally { setBusy(false); }
//     })();
//   }, [idOrSlug]);

//   if (busy) return <div className="max-w-5xl mx-auto p-4"><div className="h-40 bg-gray-100 animate-pulse rounded" /></div>;
//   if (msg && !p) return <div className="max-w-5xl mx-auto p-4 text-right">{msg}</div>;

//   const primary = p?.images?.find(i=>i.isPrimary) || p?.images?.[0];

//   return (
//     <div className="max-w-5xl mx-auto p-4">
//       <div className="mb-4">
//         <Link to="/" className="text-sm underline">חזרה לרשימה</Link>
//       </div>

//       <div className="grid gap-6 md:grid-cols-2">
//         <div className="border rounded-2xl overflow-hidden bg-gray-50">
//           {primary ? (
//             <img src={primary.url} alt={primary.alt || p.title} className="w-full h-full object-cover" />
//           ) : (
//             <div className="aspect-square grid place-items-center text-gray-400">אין תמונה</div>
//           )}
//         </div>

//         <div className="text-right">
//           <h1 className="text-2xl font-bold mb-2">{p.title}</h1>
//           <div className="text-lg font-semibold mb-4">{Number(p.price).toLocaleString()} ₪</div>
//           <div className="prose prose-sm rtl:prose-p:text-right max-w-none mb-6">
//             {p.description || "—"}
//           </div>

//           <button className="rounded-2xl bg-gray-900 text-white px-4 py-2 text-sm">
//             הוספה לעגלה
//           </button>

//           {p.images?.length > 1 && (
//             <div className="grid grid-cols-5 gap-2 mt-6">
//               {p.images.map(img => (
//                 <img key={img.key || img.url} src={img.thumbUrl || img.url} alt="" className="h-16 w-full object-cover rounded-lg border" />
//               ))}
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }
    

import React from 'react'

const StorefrontProduct = () => {
  return (
    <div>
      StorefrontProduct
    </div>
  )
}

export default StorefrontProduct

// // pages/storefront/StorefrontList.jsx
// import { useEffect, useState } from "react";
// import axios from "axios";
// import { Link } from "react-router-dom";

// function ProductCard({ p }) {
//   return (
//     <Link to={`/p/${p.slug || p._id}`} className="block border rounded-2xl overflow-hidden hover:shadow">
//       <div className="aspect-square bg-gray-50">
//         <img
//           src={p.images?.find(i=>i.isPrimary)?.url || p.images?.[0]?.url}
//           alt={p.title}
//           className="w-full h-full object-cover"
//           loading="lazy"
//         />
//       </div>
//       <div className="p-3 text-right">
//         <div className="text-sm line-clamp-2">{p.title}</div>
//         <div className="text-base font-semibold mt-1">
//           {Number(p.price).toLocaleString()} ₪
//         </div>
//       </div>
//     </Link>
//   );
// }

// export default function StorefrontList() {
//   const api = axios.create({
//     baseURL: "https://api.express48.com",
//     withCredentials: true,
//     timeout: 15000,
//   });

//   const [rows, setRows] = useState([]);
//   const [q, setQ] = useState("");
//   const [page, setPage] = useState(1);
//   const [busy, setBusy] = useState(false);
//   const [msg, setMsg] = useState("");

//   const load = async () => {
//     try {
//       setBusy(true);
//       const { data } = await api.get("/products", { params: { q, page, limit: 20 } });
//       setRows(data?.items || []);
//       setMsg("");
//     } catch (e) {
//       setMsg(e?.response?.data?.message || "שגיאה בטעינה");
//     } finally { setBusy(false); }
//   };

//   useEffect(() => { load(); }, [q, page]);

//   return (
//     <div className="max-w-6xl mx-auto p-4">
//       <div className="flex items-center justify-between mb-3">
//         <h1 className="text-xl font-bold">מוצרים</h1>
//         <input
//           placeholder="חיפוש..."
//           value={q}
//           onChange={(e)=>{ setPage(1); setQ(e.target.value); }}
//           className="input max-w-xs"
//         />
//       </div>

//       {msg && <div className="mb-3 text-sm">{msg}</div>}
//       {busy && <div className="h-10 bg-gray-100 animate-pulse rounded mb-3" />}

//       <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
//         {rows.map(p => <ProductCard key={p._id} p={p} />)}
//       </div>

//       <div className="flex justify-center gap-2 mt-6">
//         <button className="px-3 py-1 border rounded" disabled={page===1} onClick={()=>setPage(p=>Math.max(1,p-1))}>‹</button>
//         <span className="text-sm px-2">עמוד {page}</span>
//         <button className="px-3 py-1 border rounded" onClick={()=>setPage(p=>p+1)}>›</button>
//       </div>
//     </div>
//   );
// }


import React from 'react'

const StorefrontList = () => {
  return (
    <div>
      StorefrontList
    </div>
  )
}

export default StorefrontList

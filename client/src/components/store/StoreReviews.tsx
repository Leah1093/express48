// import { useEffect, useState } from "react";
// import { useOutletContext, useParams, useSearchParams } from "react-router-dom";
// import axios from "axios";

// type Review = {
//   rating: number;        // 1..5
//   title?: string;
//   text?: string;
//   author?: { name?: string };
//   createdAt?: string;
// };

// type ReviewsResponse = {
//   page: number;
//   limit: number;
//   total: number;
//   items: Review[];
// };

// const Stars = ({ value = 0 }: { value?: number }) => {
//   const full = Math.round(value || 0);
//   return (
//     <div className="flex">
//       {[1, 2, 3, 4, 5].map((i) => (
//         <svg key={i} viewBox="0 0 24 24" className={`h-5 w-5 ${i <= full ? "fill-yellow-400" : "fill-none"} stroke-yellow-400`}>
//           <path strokeWidth="1.5" d="M12 17.27 18.18 21l-1.64-7.03L22 9.24l-7.19-.62L12 2 9.19 8.62 2 9.24l5.46 4.73L5.82 21z" />
//         </svg>
//       ))}
//     </div>
//   );
// };

// export default function StoreReviews() {
//   const { slug } = useParams();
//   const { store } = useOutletContext<{ store: { seller?: { ratings?: { avg?: number; count?: number } } } }>();
//   const [params, setParams] = useSearchParams();
//   const [data, setData] = useState<ReviewsResponse | null>(null);
//   const [loading, setLoading] = useState(true);

//   const page = Math.max(1, parseInt(params.get("page") || "1"));
//   const limit = 20;

//   useEffect(() => {
//     let on = true;
//     setLoading(true);
//     (async () => {
//       try {
//         const { data } = await axios.get<ReviewsResponse>(`/api/public/store/${slug}/reviews`, { params: { page, limit } });
//         if (on) setData(data);
//       } catch {
//         if (on) setData({ page, limit, total: 0, items: [] });
//       } finally {
//         if (on) setLoading(false);
//       }
//     })();
//     return () => { on = false; };
//   }, [slug, page]);

//   if (loading) return <div className="p-4">טוען דירוגים...</div>;
//   if (!data) return null;

//   const totalPages = Math.max(1, Math.ceil((data.total || 0) / limit));
//   const avg = store?.seller?.ratings?.avg || 0;
//   const count = store?.seller?.ratings?.count || 0;

//   return (
//     <div className="space-y-4">
//       {/* קופסת סיכום צרה ומרכזית */}
//       <div className="mx-auto max-w-3xl rounded-xl border bg-white p-4">
//         <div className="text-lg font-semibold">ציון ממוצע</div>
//         <div className="mt-1 flex items-center gap-3">
//           <Stars value={avg} />
//           <div className="text-lg">{count ? `${avg.toFixed(1)} · ${count} מדרגים` : "אין דירוגים עדיין"}</div>
//         </div>
//       </div>

//       {/* רשימת ביקורות */}
//       <div className="mx-auto max-w-3xl space-y-3">
//         {data.items?.map((r, i) => (
//           <article key={i} className="rounded-xl border bg-white p-4">
//             <div className="flex items-center justify-between">
//               <Stars value={r.rating} />
//               {r.createdAt && <time className="text-xs text-gray-500">{new Date(r.createdAt).toLocaleDateString("he-IL")}</time>}
//             </div>
//             {r.title && <div className="mt-1 font-medium">{r.title}</div>}
//             {r.text && <p className="mt-1 text-gray-800">{r.text}</p>}
//             {r.author?.name && <div className="mt-2 text-xs text-gray-500">מאת {r.author.name}</div>}
//           </article>
//         ))}
//         {!data.items?.length && (
//           <div className="rounded-xl border bg-white p-6 text-center text-gray-600">אין ביקורות להצגה.</div>
//         )}
//       </div>

//       {/* פאג'ינציה */}
//       <div className="mx-auto mt-2 flex max-w-3xl items-center justify-between">
//         <button onClick={() => setParams({ page: String(Math.max(1, page - 1)) })} disabled={page <= 1} className="rounded-lg border px-3 py-1 text-sm disabled:opacity-50">
//           קודם
//         </button>
//         <div className="text-sm">עמוד {page} מתוך {totalPages}</div>
//         <button onClick={() => setParams({ page: String(page + 1)) }} disabled={page >= totalPages} className="rounded-lg border px-3 py-1 text-sm disabled:opacity-50">
//           הבא
//         </button>
//       </div>
//     </div>
//   );
// }


import React from 'react'

const StoreReviews = () => {
  return (
    <div>
      
    </div>
  )
}

export default StoreReviews



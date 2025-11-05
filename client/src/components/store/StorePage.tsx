// import React, { useEffect, useState } from "react";
// import { NavLink, Outlet, useParams } from "react-router-dom";
// import axios from "axios";
// import { abs } from "./abs";

// const RatingStars = ({ avg = 0, count = 0 }) => {
//   const full = Math.round(avg || 0);
//   return (
//     <div className="flex items-center gap-2">
//       <div className="flex">
//         {[1,2,3,4,5].map(i => (
//           <svg key={i} viewBox="0 0 24 24" className={`h-5 w-5 ${i <= full ? "fill-yellow-400" : "fill-none"} stroke-yellow-400`}>
//             <path strokeWidth="1.5" d="M12 17.27 18.18 21l-1.64-7.03L22 9.24l-7.19-.62L12 2 9.19 8.62 2 9.24l5.46 4.73L5.82 21z"/>
//           </svg>
//         ))}
//       </div>
//       {count ? <span className="text-sm text-gray-300">{avg.toFixed(1)} · {count}</span> : null}
//     </div>
//   );
// };

// function BannerMedia({ store, height = "h-[280px] md:h-[420px]" }) {
//   const m = store.branding || {};
//   return (
//     <div className={`relative w-full overflow-hidden ${height}`}>
//       {m.bannerType === "video" && m.banner?.url ? (
//         <video className="h-full w-full object-cover bg-gray-300" muted playsInline autoPlay loop src={abs(m.banner.url)} />
//       ) : m.bannerType === "slider" && (m.slider?.length > 0) ? (
//         <img src={abs(m.slider[0].url)} alt={m.slider[0].alt || store.name} className="h-full w-full object-cover bg-gray-300" />
//       ) : m.banner?.url ? (
//         <img src={abs(m.banner.url)} alt={m.banner.alt || store.name} className="h-full w-full object-cover bg-gray-300" />
//       ) : (
//         <div className="h-full w-full bg-gray-300" />
//       )}
//     </div>
//   );
// }

// const HeaderOverBanner = ({ store }) => (
//   <div className="relative w-full" dir="rtl">
//     <BannerMedia store={store} />
//     <div className="absolute bottom-0 left-0 right-0 h-24 bg-neutral-800/95" />
//     <div className="absolute bottom-6 right-[6%] z-10">
//       <div className="h-28 w-28 overflow-hidden rounded-full bg-white ring-4 ring-neutral-800 shadow-xl">
//         {store.branding?.logo?.url && (
//           <img src={abs(store.branding.logo.url)} alt={store.branding.logo.alt || store.name} className="h-full w-full object-cover" />
//         )}
//       </div>
//     </div>
//     <div className="absolute bottom-4 left-0 right-0 z-10">
//       <div className="mx-auto flex max-w-5xl flex-col items-center gap-2 px-4 text-white">
//         <h1 className="text-2xl font-semibold">{store.name}</h1>
//         <div className="flex items-center gap-4 text-sm">
//           {!store.appearance?.hideEmail && store.contactEmail && (
//             <a href={`mailto:${store.contactEmail}`} className="inline-flex items-center gap-2 hover:opacity-90">
//               <svg viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-white"><path d="M3 5h18v14H3z"/><path d="M3 7l9 6 9-6"/></svg>
//               {store.contactEmail}
//             </a>
//           )}
//           {!store.appearance?.hidePhone && store.phone && <span className="opacity-90">{store.phone}</span>}
//         </div>
//         <RatingStars avg={store.seller?.ratings?.avg || 0} count={store.seller?.ratings?.count || 0} />
//       </div>
//     </div>
//   </div>
// );

// const HeaderBelow = ({ store }) => (
//   <>
//     <BannerMedia store={store} />
//     <div className="mx-auto max-w-6xl px-4">
//       <div className="relative -mt-12 flex flex-col items-center gap-2 rounded-xl bg-neutral-800/95 px-4 py-4 text-white shadow-md">
//         <div className="absolute -top-10 right-[6%]">
//           <div className="h-28 w-28 overflow-hidden rounded-full bg-white ring-4 ring-neutral-800 shadow-xl">
//             {store.branding?.logo?.url && (
//               <img src={abs(store.branding.logo.url)} alt={store.branding.logo.alt || store.name} className="h-full w-full object-cover" />
//             )}
//           </div>
//         </div>
//         <h1 className="text-2xl font-semibold">{store.name}</h1>
//         <div className="flex items-center gap-4 text-sm">
//           {!store.appearance?.hideEmail && store.contactEmail && (
//             <a href={`mailto:${store.contactEmail}`} className="inline-flex items-center gap-2 hover:opacity-90">
//               <svg viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-white"><path d="M3 5h18v14H3z"/><path d="M3 7l9 6 9-6"/></svg>
//               {store.contactEmail}
//             </a>
//           )}
//           {!store.appearance?.hidePhone && store.phone && <span className="opacity-90">{store.phone}</span>}
//         </div>
//         <RatingStars avg={store.seller?.ratings?.avg || 0} count={store.seller?.ratings?.count || 0} />
//       </div>
//     </div>
//   </>
// );

// export default function StorePage() {
//   const { slug } = useParams();
//   const [store, setStore] = useState(null);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     let on = true;
//     (async () => {
//       try {
//         const { data } = await axios.get(`/api/public/store/${slug}`);
//         if (on) setStore(data);
//       } catch {
//         if (on) setStore(null);
//       } finally {
//         if (on) setLoading(false);
//       }
//     })();
//     return () => { on = false; };
//   }, [slug]);

//   if (loading) return <div className="p-6" dir="rtl">טוען...</div>;
//   if (!store) return <div className="p-6" dir="rtl">החנות לא נמצאה</div>;

//   const namePos = store.appearance?.storeNamePosition || "over-banner";

//   return (
//     <div dir="rtl" className="min-h-screen">
//       {namePos === "over-banner" && <HeaderOverBanner store={store} />}
//       {(namePos === "header" || namePos === "hidden") && <BannerMedia store={store} />}
//       {namePos === "header" && <HeaderBelow store={store} />}

//       {/* טאבים */}
//       <div className="mx-auto max-w-6xl px-4">
//         <div className="mt-4 flex justify-end gap-2">
//           {[
//             { to: "", label: "מוצרים" },
//             { to: "about", label: "אודות" },
//             { to: "reviews", label: "דירוגים" }
//           ].map(t => (
//             <NavLink
//               key={t.to}
//               end={t.to === ""}
//               to={t.to}
//               className={({ isActive }) =>
//                 `h-10 rounded-full border px-5 text-sm leading-10 transition
//                  ${isActive
//                    ? "bg-sky-600 text-white border-sky-600 shadow-sm"
//                    : "bg-white text-gray-800 border-gray-300 hover:bg-gray-50"}`
//               }
//             >
//               {t.label}
//             </NavLink>
//           ))}
//         </div>
//         <div className="mt-3 h-px w-full bg-gray-200" />
//         <div className="mt-4">
//           <Outlet context={{ store }} />
//         </div>
//       </div>
//     </div>
//   );
// }



import React from 'react'

const StorePage = () => {
  return (
    <div>
      store
    </div>
  )
}

export default StorePage

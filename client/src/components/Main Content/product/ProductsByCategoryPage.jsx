// import { Link, useParams, useSearchParams, useLocation, useNavigate } from "react-router-dom";
// import { useSelector } from "react-redux";
// import { useEffect } from "react";
// import { useGetByCategoryQuery } from "../../../redux/services/productsApi";
// import ProductCard from "./ProductCard";

// export default function ProductsByCategoryPage() {

//     const byCatUrl = (fullSlug, page = 1, limit = 24) =>
//   `/products/by-category/${fullSlug}?page=${page}&limit=${limit}`;

//   // ---- hooks תמיד באותו סדר, בלי החזרות מוקדמות ----
//   const { "*": fullSlugRaw = "" } = useParams();
//   const fullSlug = String(fullSlugRaw || "").trim();
//   const hasSlug = fullSlug.length > 0;

//   const [sp] = useSearchParams();
//   const location = useLocation();
//   const navigate = useNavigate();

//   const DEFAULT_PAGE = 1;
//   const DEFAULT_LIMIT = 24;

//   const page = Number(sp.get("page") || DEFAULT_PAGE);
//   const limit = Number(sp.get("limit") || DEFAULT_LIMIT);

//   const favorites = useSelector((s) => s.favorites?.items || []);

//   // דואג שתמיד יהיו ?page&limit ב־URL, אבל לא עושה כלום אם אין slug
//   useEffect(() => {
//     if (!hasSlug) return;
//     const params = new URLSearchParams(location.search);
//     let changed = false;
//     if (!params.get("page"))  { params.set("page", String(DEFAULT_PAGE)); changed = true; }
//     if (!params.get("limit")) { params.set("limit", String(DEFAULT_LIMIT)); changed = true; }
//     if (changed) navigate(`${location.pathname}?${params.toString()}`, { replace: true });
//   }, [hasSlug, location.pathname, location.search, navigate]);

//   // כשמשנים קטגוריה – לאפס לעמוד 1
//   useEffect(() => {
//     if (!hasSlug) return;
//     const params = new URLSearchParams(location.search);
//     const currentPage = Number(params.get("page") || DEFAULT_PAGE);
//     if (currentPage !== DEFAULT_PAGE) {
//       params.set("page", String(DEFAULT_PAGE));
//       params.set("limit", String(limit || DEFAULT_LIMIT));
//       navigate(`${location.pathname}?${params.toString()}`, { replace: true });
//     }
//   }, [hasSlug, fullSlug, limit, location.search, location.pathname, navigate]);

//   // שליפת מוצרים – מדלגים אם אין slug כדי לשמור על hooks קבועים
//   const { data, isFetching, isError, isUninitialized } = useGetByCategoryQuery(
//     { fullSlug, page, limit },
//     { skip: !hasSlug }
//   );

//   // ---- רנדר (אפשר להתנות כאן חופשי) ----
//   if (!hasSlug) {
//     return <div className="p-6" dir="rtl">כתובת קטגוריה שגויה</div>;
//   }

//   if (isError) {
//     return <div className="p-6" dir="rtl">שגיאה בטעינת מוצרים</div>;
//   }

//   if (isFetching || isUninitialized) {
//     return <div className="p-6" dir="rtl">טוען...</div>;
//   }

//   const items = data?.items ?? [];
//   const total = data?.total ?? 0;
//   const pages = Math.max(1, Math.ceil(total / (limit || DEFAULT_LIMIT)));

//   const makePageLink = (pg) => {
//     const params = new URLSearchParams(location.search);
//     params.set("page", String(pg));
//     params.set("limit", String(limit || DEFAULT_LIMIT));
//     return `${location.pathname}?${params.toString()}`;
//   };

//   return (
//     <div dir="rtl" className="max-w-[1328px] mx-auto px-4 sm:px-6 md:px-8 py-6">
//       <h1 className="text-2xl font-bold mb-4">מוצרים</h1>

//       {items.length === 0 && <div>לא נמצאו מוצרים</div>}

//       <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
//         {items.map((product) => (
//           <ProductCard key={product._id} product={product} favorites={favorites} />
//         ))}
//       </div>

//       {pages > 1 && (
//         <div className="flex justify-center gap-2 mt-6">
//           {Array.from({ length: pages }, (_, i) => i + 1).map((pg) => (
//             <Link
//               key={pg}
//               to={makePageLink(pg)}
//               className={`px-3 py-1 rounded border ${
//                 pg === page ? "bg-[#FF6500] text-white border-[#FF6500]" : "bg-white"
//               }`}
//             >
//               {pg}
//             </Link>
//           ))}
//         </div>
//       )}
//     </div>
//   );
// }
import { Link, useParams, useSearchParams, useLocation, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { useEffect, useMemo } from "react";
import { useGetByCategoryQuery } from "../../../redux/services/productsApi";
import ProductCard from "./ProductCard";

export default function ProductsByCategoryPage() {
  // המסלול מוגדר כ: /products/by-category/*
  const { "*": fullSlug = "" } = useParams();
  const [sp] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();

  const DEFAULT_PAGE = 1;
  const DEFAULT_LIMIT = 24;

  // חשוב: לא להחזיר לפני שכל ה-hooks הוגדרו (כדי למנוע Hook order mismatch)
  const page = Number(sp.get("page") || DEFAULT_PAGE);
  const limit = Number(sp.get("limit") || DEFAULT_LIMIT);

  const favorites = useSelector((s) => s.favorites?.items || []);

  // הבטחה שתמיד יש page/limit ב-URL (גם בכניסה ראשונה/הדבקה)
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    let changed = false;
    if (!params.get("page"))  { params.set("page", String(DEFAULT_PAGE)); changed = true; }
    if (!params.get("limit")) { params.set("limit", String(DEFAULT_LIMIT)); changed = true; }
    if (changed) {
      navigate(`${location.pathname}?${params.toString()}`, { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]); // נרוץ רק כשמשנים קטגוריה

  // איפוס לעמוד 1 כשמחליפים קטגוריה (אם מודבק page גבוה)
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const currentPage = Number(params.get("page") || DEFAULT_PAGE);
    if (currentPage !== DEFAULT_PAGE) {
      params.set("page", String(DEFAULT_PAGE));
      params.set("limit", String(limit || DEFAULT_LIMIT));
      navigate(`${location.pathname}?${params.toString()}`, { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fullSlug]);

  const { data, isFetching, isError, isUninitialized } = useGetByCategoryQuery(
    { fullSlug, page, limit },
    { skip: !fullSlug }
  );

  const isBadSlug = !fullSlug;
  const items = data?.items ?? [];
  const total = data?.total ?? 0;
  const pages = useMemo(() => Math.max(1, Math.ceil(total / (limit || DEFAULT_LIMIT))), [total, limit]);

  // UI
  if (isBadSlug) {
    return <div className="p-6">כתובת קטגוריה שגויה</div>;
  }
  if (isError) {
    return <div className="p-6">שגיאה בטעינת מוצרים</div>;
  }
  if (isFetching || isUninitialized) {
    return <div className="p-6">טוען...</div>;
  }

  const makePageLink = (pg) => {
    const params = new URLSearchParams(location.search);
    params.set("page", String(pg));
    params.set("limit", String(limit || DEFAULT_LIMIT));
    return `${location.pathname}?${params.toString()}`;
  };

  return (
    <div dir="rtl" className="max-w-[1328px] mx-auto px-4 sm:px-6 md:px-8 py-6">
      <h1 className="text-2xl font-bold mb-4">מוצרים</h1>

      {items.length === 0 && <div>לא נמצאו מוצרים</div>}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((product) => (
          <ProductCard key={product._id} product={product} favorites={favorites} />
        ))}
      </div>

      {pages > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          {Array.from({ length: pages }, (_, i) => i + 1).map((pg) => (
            <Link
              key={pg}
              to={makePageLink(pg)}
              className={`px-3 py-1 rounded border ${
                pg === page ? "bg-[#FF6500] text-white border-[#FF6500]" : "bg-white"
              }`}
            >
              {pg}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

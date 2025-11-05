// // src/pages/SellerProductsPage.jsx
// import { useState, useMemo } from "react";
// import axios from "axios";
// import { Link } from "react-router-dom";
// import {
//     useListSellerProductsQuery,
//     useUpdateSellerProductStatusMutation,
// } from "../../redux/services/sellerProductsApi";

// export default function SellerProductsPage() {
//     const [page, setPage] = useState(1);
//     const [search, setSearch] = useState("");
//     const [sort, setSort] = useState("-updatedAt");
//     const [deletedFilter, setDeletedFilter] = useState("active"); // "active" | "deleted" | "all"
//     const [statusFilter, setStatusFilter] = useState("");         // "" | "draft" | "published" | "suspended"

//     const [deletingId, setDeletingId] = useState(null);
//     const [restoringId, setRestoringId] = useState(null);

//     // RTK: עדכון סטטוס מהיר
//     const [updateStatus, { isLoading: isUpdatingStatus }] =
//         useUpdateSellerProductStatusMutation();

//     // פרמטרים לשרת
//     const params = useMemo(
//         () => ({ page, limit: 20, sort, search, deleted: deletedFilter, status: statusFilter }),
//         [page, sort, search, deletedFilter, statusFilter]
//     );

//     const { data, isFetching, isError, refetch } = useListSellerProductsQuery(params, {
//         refetchOnMountOrArgChange: true,
//         refetchOnFocus: true,
//         refetchOnReconnect: true,
//     });

//     const items = data?.items ?? [];
//     const total = data?.total ?? 0;
//     const hasNext = data?.hasNextPage ?? false;

//     // מחיקה רכה
//     async function handleSoftDelete(id) {
//         if (!id) return;
//         const ok = window.confirm("למחוק את המוצר במחיקה רכה? ניתן לשחזר מאוחר יותר.");
//         if (!ok) return;
//         try {
//             setDeletingId(id);
//             // אם יש proxy של Vite אפשר להשתמש בנתיב יחסי: `/seller/products/${id}`
//             await axios.delete(`https://api.express48.com/seller/products/${id}`, { withCredentials: true });
//             await refetch();
//         } catch (e) {
//             alert(e?.response?.data?.error || e?.message || "שגיאה במחיקה");
//         } finally {
//             setDeletingId(null);
//         }
//     }

//     // שחזור ממחיקה רכה
//     async function handleRestore(id) {
//         if (!id) return;
//         try {
//             setRestoringId(id);
//             await axios.patch(`https://api.express48.com/seller/products/${id}/restore`, null, { withCredentials: true });
//             await refetch();
//         } catch (e) {
//             alert(e?.response?.data?.error || e?.message || "שגיאה בשחזור");
//         } finally {
//             setRestoringId(null);
//         }
//     }

//     // פעולה מהירה לשינוי סטטוס (draft→published, published→suspended, suspended→published)
//     async function handleQuickStatus(p) {
//         const next =
//             p.status === "draft" ? "published" :
//                 p.status === "published" ? "suspended" :
//                     "published"; // אם מושהה → פרסם שוב

//         try {
//             await updateStatus({ id: p._id, status: next }).unwrap();
//             await refetch();
//         } catch (e) {
//             console.log(e)
//             const msg =
//                 e?.response?.data?.message || // ההודעה הראשית (כמו "מוצר מפורסם חייב לכלול לפחות תמונה אחת")
//                 e?.response?.data?.error ||   // fallback: "ValidationError" / "Forbidden"
//                 e?.data?.message ||                 // הודעת JS רגילה
//                 "שגיאה בעדכון סטטוס";        // fallback סופי

//             alert(msg);
//         }
//     }

//     if (isError) return <div className="p-4 text-red-600">שגיאה בטעינת מוצרים</div>;

//     return (
//         <div dir="rtl" className="p-4 max-w-7xl mx-auto">
//             <Link to="/seller/products/new" className="btn">מוצר חדש</Link>
//             <h1 className="text-2xl font-bold mb-4">המוצרים שלי</h1>

//             {/* חיפוש, מיון וסינונים */}
//             <div className="flex gap-2 mb-4">
//                 <input
//                     value={search}
//                     onChange={(e) => { setPage(1); setSearch(e.target.value); }}
//                     placeholder="חיפוש לפי שם/מותג/SKU/ברקוד"
//                     className="border rounded-xl px-3 py-2 w-full"
//                 />

//                 <select
//                     value={sort}
//                     onChange={(e) => setSort(e.target.value)}
//                     className="border rounded-xl px-3 py-2"
//                 >
//                     <option value="-updatedAt">מעודכן אחרון</option>
//                     <option value="title">שם</option>
//                     <option value="brand">מותג</option>
//                     <option value="-price">מחיר ↓</option>
//                     <option value="+price">מחיר ↑</option>
//                     <option value="-stock">מלאי ↓</option>
//                     <option value="stock">מלאי ↑</option>
//                 </select>

//                 {/* סינון מחוקים */}
//                 <select
//                     value={deletedFilter}
//                     onChange={(e) => { setPage(1); setDeletedFilter(e.target.value); }}
//                     className="border rounded-xl px-3 py-2"
//                     title="סינון לפי מחיקה"
//                 >
//                     <option value="active">רק פעילים</option>
//                     <option value="deleted">רק מחוקים</option>
//                     <option value="all">הכל</option>
//                 </select>

//                 {/* סינון סטטוס */}
//                 <select
//                     value={statusFilter}
//                     onChange={(e) => { setPage(1); setStatusFilter(e.target.value); }}
//                     className="border rounded-xl px-3 py-2"
//                     title="סינון לפי סטטוס"
//                 >
//                     <option value="">כל הסטטוסים</option>
//                     <option value="draft">טיוטא</option>
//                     <option value="published">מפורסם</option>
//                     <option value="suspended">מושהה</option>
//                 </select>
//             </div>

//             {/* טבלה */}
//             <div className="rounded-xl border bg-white overflow-hidden">
//                 <table className="w-full text-sm">
//                     <thead className="bg-gray-50">
//                         <tr className="text-right">
//                             <th className="p-3">תמונה</th>
//                             <th className="p-3">שם</th>
//                             <th className="p-3">מותג</th>
//                             <th className="p-3">SKU</th>
//                             <th className="p-3">מחיר</th>
//                             <th className="p-3">מלאי</th>
//                             <th className="p-3">סטטוס</th>
//                             <th className="p-3">עודכן</th>
//                             <th className="p-3">פעולות</th>
//                         </tr>
//                     </thead>
//                     <tbody>
//                         {isFetching && !items.length ? (
//                             <tr>
//                                 <td className="p-4" colSpan={9}>טוען…</td>
//                             </tr>
//                         ) : items.length ? (
//                             items.map((p) => (
//                                 <tr
//                                     key={p._id}
//                                     className={`border-t hover:bg-gray-50 ${p.isDeleted ? "opacity-60" : ""}`}
//                                 >
//                                     <td className="p-3">
//                                         {p.images?.[0] ? (
//                                             <img src={p.images[0]} alt="" className="w-12 h-12 object-cover rounded-md" />
//                                         ) : (
//                                             <div className="w-12 h-12 bg-gray-200 rounded-md" />
//                                         )}
//                                     </td>

//                                     <td className="p-3">
//                                         <a
//                                             href={`/seller/products/${p._id}`}
//                                             target="_blank"
//                                             rel="noopener noreferrer"
//                                             className="text-blue-600 hover:underline"
//                                         >
//                                             {p.title}
//                                         </a>
//                                         {p.isDeleted && (
//                                             <span className="ml-2 text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-700">
//                                                 נמחק
//                                             </span>
//                                         )}
//                                     </td>

//                                     <td className="p-3">{p.brand || "-"}</td>
//                                     <td className="p-3">{p.sku}</td>
//                                     <td className="p-3">{p?.price?.amount?.toLocaleString?.("he-IL") ?? "-"}</td>
//                                     <td className="p-3">{p.stock ?? 0}</td>

//                                     <td className="p-3">
//                                         <span className="px-2 py-1 rounded-full text-xs bg-gray-100">
//                                             {p.status}
//                                         </span>
//                                     </td>

//                                     <td className="p-3">
//                                         {p.updatedAt ? new Date(p.updatedAt).toLocaleString("he-IL") : "-"}
//                                     </td>

//                                     {/* פעולות */}
//                                     <td className="p-3">
//                                         <div className="flex flex-wrap items-center gap-2">
//                                             <Link
//                                                 to={`/seller/products/${p._id}/edit`}
//                                                 className="px-2 py-1 border rounded-lg hover:bg-gray-50"
//                                             >
//                                                 עריכה
//                                             </Link>

//                                             <Link
//                                                 to={`/seller/products/${p._id}`}
//                                                 className="px-2 py-1 border rounded-lg hover:bg-gray-50"
//                                             >
//                                                 פרטים
//                                             </Link>

//                                             {/* כפתור סטטוס מהיר */}
//                                             <button
//                                                 type="button"
//                                                 onClick={() => handleQuickStatus(p)}
//                                                 disabled={isUpdatingStatus}
//                                                 className="px-2 py-1 border rounded-lg hover:bg-blue-50"
//                                                 title={
//                                                     p.status === "draft" ? "פרסם" :
//                                                         p.status === "published" ? "השהה" :
//                                                             "פרסם שוב"
//                                                 }
//                                             >
//                                                 {p.status === "draft" && "פרסם"}
//                                                 {p.status === "published" && "השהה"}
//                                                 {p.status === "suspended" && "פרסם שוב"}
//                                             </button>

//                                             {/* פח/שחזור */}
//                                             {!p.isDeleted && (
//                                                 <button
//                                                     type="button"
//                                                     title="מחיקה רכה"
//                                                     onClick={() => handleSoftDelete(p._id)}
//                                                     disabled={deletingId === p._id}
//                                                     className={`px-2 py-1 border rounded-lg hover:bg-red-50 ${deletingId === p._id ? "opacity-60 cursor-not-allowed" : ""}`}
//                                                 >
//                                                     🗑️
//                                                 </button>
//                                             )}
//                                             {p.isDeleted && (
//                                                 <button
//                                                     type="button"
//                                                     title="שחזור מוצר"
//                                                     onClick={() => handleRestore(p._id)}
//                                                     disabled={restoringId === p._id}
//                                                     className={`px-2 py-1 border rounded-lg hover:bg-green-50 ${restoringId === p._id ? "opacity-60 cursor-not-allowed" : ""}`}
//                                                 >
//                                                     🔄 שחזור
//                                                 </button>
//                                             )}
//                                         </div>
//                                     </td>
//                                 </tr>
//                             ))
//                         ) : (
//                             <tr>
//                                 <td className="p-4" colSpan={9}>אין מוצרים להצגה.</td>
//                             </tr>
//                         )}
//                     </tbody>
//                 </table>
//             </div>

//             {/* עימוד */}
//             <div className="flex items-center justify-between mt-4">
//                 <span className="text-sm opacity-70">סה״כ: {total}</span>
//                 <div className="flex gap-2">
//                     <button
//                         className="px-3 py-2 border rounded-lg disabled:opacity-50"
//                         disabled={page <= 1}
//                         onClick={() => setPage((p) => Math.max(1, p - 1))}
//                     >
//                         הקודם
//                     </button>
//                     <button
//                         className="px-3 py-2 border rounded-lg disabled:opacity-50"
//                         disabled={!hasNext}
//                         onClick={() => setPage((p) => p + 1)}
//                     >
//                         הבא
//                     </button>
//                 </div>
//             </div>
//         </div>
//     );
// }



import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  useListSellerProductsQuery,
  useUpdateSellerProductStatusMutation,
  useDeleteSellerProductMutation,
  useRestoreSellerProductMutation,
} from "../../redux/services/sellerProductsApi";

export default function SellerProductsPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("-updatedAt");
  const [deletedFilter, setDeletedFilter] = useState("active");
  const [statusFilter, setStatusFilter] = useState("");

  const [deletingId, setDeletingId] = useState(null);
  const [restoringId, setRestoringId] = useState(null);

  const [updateStatus, { isLoading: isUpdatingStatus }] =
    useUpdateSellerProductStatusMutation();
  const [deleteProduct] = useDeleteSellerProductMutation();
  const [restoreProduct] = useRestoreSellerProductMutation();

  const params = useMemo(
    () => ({ page, limit: 20, sort, search, deleted: deletedFilter, status: statusFilter }),
    [page, sort, search, deletedFilter, statusFilter]
  );

  const { data, isFetching, isError, refetch } = useListSellerProductsQuery(params, {
    refetchOnMountOrArgChange: true,
    refetchOnFocus: true,
    refetchOnReconnect: true,
  });

  const items = data?.items ?? [];
  const total = data?.total ?? 0;
  const hasNext = data?.hasNextPage ?? false;

  // מחיקה רכה
  async function handleSoftDelete(id) {
    if (!id) return;
    const ok = window.confirm("למחוק את המוצר במחיקה רכה? ניתן לשחזר מאוחר יותר.");
    if (!ok) return;
    try {
      console.log("😘😘😘😘😘")

      setDeletingId(id);
      await deleteProduct(id).unwrap();
      await refetch();
    } catch (e) {
      alert(e?.data?.error || e?.message || "שגיאה במחיקה");
    } finally {
      setDeletingId(null);
    }
  }

  // שחזור ממחיקה
  async function handleRestore(id) {
    if (!id) return;
    try {
      setRestoringId(id);
      await restoreProduct(id).unwrap();
      await refetch();
    } catch (e) {
      alert(e?.data?.error || e?.message || "שגיאה בשחזור");
    } finally {
      setRestoringId(null);
    }
  }

  // עדכון סטטוס מהיר
  async function handleQuickStatus(p) {
    const next =
      p.status === "draft" ? "published" :
      p.status === "published" ? "suspended" :
      "published";
    try {
      await updateStatus({ id: p._id, status: next }).unwrap();
      await refetch();
    } catch (e) {
      const msg =
        e?.data?.message ||
        e?.data?.error ||
        e?.message ||
        "שגיאה בעדכון סטטוס";
      alert(msg);
    }
  }

  if (isError) return <div className="p-4 text-red-600">שגיאה בטעינת מוצרים</div>;

  return (
    <div dir="rtl" className="p-4 max-w-7xl mx-auto">
      <Link to="/seller/products/new" className="btn">מוצר חדש</Link>
      <h1 className="text-2xl font-bold mb-4">המוצרים שלי</h1>

      {/* חיפוש וסינונים */}
      <div className="flex gap-2 mb-4">
        <input
          value={search}
          onChange={(e) => { setPage(1); setSearch(e.target.value); }}
          placeholder="חיפוש לפי שם/מותג/SKU/ברקוד"
          className="border rounded-xl px-3 py-2 w-full"
        />

        <select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          className="border rounded-xl px-3 py-2"
        >
          <option value="-updatedAt">מעודכן אחרון</option>
          <option value="title">שם</option>
          <option value="brand">מותג</option>
          <option value="-price">מחיר ↓</option>
          <option value="+price">מחיר ↑</option>
          <option value="-stock">מלאי ↓</option>
          <option value="stock">מלאי ↑</option>
        </select>

        <select
          value={deletedFilter}
          onChange={(e) => { setPage(1); setDeletedFilter(e.target.value); }}
          className="border rounded-xl px-3 py-2"
        >
          <option value="active">רק פעילים</option>
          <option value="deleted">רק מחוקים</option>
          <option value="all">הכל</option>
        </select>

        <select
          value={statusFilter}
          onChange={(e) => { setPage(1); setStatusFilter(e.target.value); }}
          className="border rounded-xl px-3 py-2"
        >
          <option value="">כל הסטטוסים</option>
          <option value="draft">טיוטא</option>
          <option value="published">מפורסם</option>
          <option value="suspended">מושהה</option>
        </select>
      </div>

      {/* טבלה */}
      <div className="rounded-xl border bg-white overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr className="text-right">
              <th className="p-3">תמונה</th>
              <th className="p-3">שם</th>
              <th className="p-3">מותג</th>
              <th className="p-3">SKU</th>
              <th className="p-3">מחיר</th>
              <th className="p-3">מלאי</th>
              <th className="p-3">סטטוס</th>
              <th className="p-3">עודכן</th>
              <th className="p-3">פעולות</th>
            </tr>
          </thead>
          <tbody>
            {isFetching && !items.length ? (
              <tr><td className="p-4" colSpan={9}>טוען…</td></tr>
            ) : items.length ? (
              items.map((p) => (
                <tr key={p._id} className={`border-t hover:bg-gray-50 ${p.isDeleted ? "opacity-60" : ""}`}>
                  <td className="p-3">
                    {p.images?.[0] ? (
                      <img src={p.images[0]} alt="" className="w-12 h-12 object-cover rounded-md" />
                    ) : (
                      <div className="w-12 h-12 bg-gray-200 rounded-md" />
                    )}
                  </td>
                  <td className="p-3">
                    <a href={`/seller/products/${p._id}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                      {p.title}
                    </a>
                    {p.isDeleted && (
                      <span className="ml-2 text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-700">נמחק</span>
                    )}
                  </td>
                  <td className="p-3">{p.brand || "-"}</td>
                  <td className="p-3">{p.sku}</td>
                  <td className="p-3">{p?.price?.amount?.toLocaleString?.("he-IL") ?? "-"}</td>
                  <td className="p-3">{p.stock ?? 0}</td>
                  <td className="p-3">
                    <span className="px-2 py-1 rounded-full text-xs bg-gray-100">{p.status}</span>
                  </td>
                  <td className="p-3">{p.updatedAt ? new Date(p.updatedAt).toLocaleString("he-IL") : "-"}</td>
                  <td className="p-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <Link to={`/seller/products/${p._id}/edit`} className="px-2 py-1 border rounded-lg hover:bg-gray-50">עריכה</Link>
                      <Link to={`/seller/products/${p._id}`} className="px-2 py-1 border rounded-lg hover:bg-gray-50">פרטים</Link>
                      <button type="button" onClick={() => handleQuickStatus(p)} disabled={isUpdatingStatus} className="px-2 py-1 border rounded-lg hover:bg-blue-50">
                        {p.status === "draft" && "פרסם"}
                        {p.status === "published" && "השהה"}
                        {p.status === "suspended" && "פרסם שוב"}
                      </button>
                      {!p.isDeleted && (
                        <button type="button" onClick={() => handleSoftDelete(p._id)} disabled={deletingId === p._id} className="px-2 py-1 border rounded-lg hover:bg-red-50">
                          🗑️
                        </button>
                      )}
                      {p.isDeleted && (
                        <button type="button" onClick={() => handleRestore(p._id)} disabled={restoringId === p._id} className="px-2 py-1 border rounded-lg hover:bg-green-50">
                          🔄 שחזור
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr><td className="p-4" colSpan={9}>אין מוצרים להצגה.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* עימוד */}
      <div className="flex items-center justify-between mt-4">
        <span className="text-sm opacity-70">סה״כ: {total}</span>
        <div className="flex gap-2">
          <button className="px-3 py-2 border rounded-lg disabled:opacity-50" disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>
            הקודם
          </button>
          <button className="px-3 py-2 border rounded-lg disabled:opacity-50" disabled={!hasNext} onClick={() => setPage((p) => p + 1)}>
            הבא
          </button>
        </div>
      </div>
    </div>
  );
}

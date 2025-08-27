import SellerStatusBadge from "./SellerStatusBadge.jsx";

export default function AdminApplicationsTable({ items, loading, onView, onQuickStatus, updating }) {
  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow p-6 text-center">טוען…</div>
    );
  }
  if (!items?.length) {
    return (
      <div className="bg-white rounded-xl shadow p-6 text-center">אין נתונים</div>
    );
  }

  return (
    <div className="overflow-x-auto bg-white rounded-xl shadow">
      <table className="min-w-full">
        <thead className="bg-slate-50 text-right">
          <tr className="text-sm text-slate-600">
            <th className="p-3">סטטוס</th>
            <th className="p-3">חברה/חנות</th>
            <th className="p-3">שם מלא</th>
            <th className="p-3">אימייל</th>
            <th className="p-3">טלפון</th>
            <th className="p-3">נוצר</th>
            <th className="p-3">פעולות</th>
          </tr>
        </thead>
        <tbody>
        {items.map((s) => (
          <tr key={s._id} className="border-t hover:bg-slate-50">
            <td className="p-3"><SellerStatusBadge status={s.status} /></td>
            <td className="p-3">{s.companyName}</td>
            <td className="p-3">{s.fullName}</td>
            <td className="p-3">{s.email}</td>
            <td className="p-3">{s.phone || "-"}</td>
            <td className="p-3 whitespace-nowrap">{new Date(s.createdAt).toLocaleString("he-IL")}</td>
            <td className="p-3">
              <div className="flex items-center gap-2">
                <button className="px-3 py-1 rounded bg-slate-200 hover:bg-slate-300"
                        onClick={() => onView?.(s)}>
                  צפייה
                </button>

                <select
                  disabled={updating}
                  className="border rounded p-1"
                  defaultValue=""
                  onChange={(e) => { const val = e.target.value; e.target.value = ""; onQuickStatus?.(s, val); }}
                >
                  <option value="" disabled>עדכון מהיר…</option>
                  <option value="approved">לאשר</option>
                  <option value="rejected">לדחות</option>
                  <option value="suspended">להשהות</option>
                  <option value="new">להחזיר ל־חדש</option>
                </select>
              </div>
            </td>
          </tr>
        ))}
        </tbody>
      </table>
    </div>
  );
}

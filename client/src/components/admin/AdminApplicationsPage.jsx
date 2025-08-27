import { useEffect, useMemo, useState } from "react";
import { fetchApplications ,updateApplicationStatus} from "./adminApplicationsApi.js";
import AdminApplicationsTable from "../../components/admin/AdminApplicationsTable.jsx";
import AdminApplicationDetails from "../../components/admin/AdminApplicationDetails.jsx";

export default function AdminApplicationsPage() {
  const [status, setStatus] = useState("");   // "" = כולם
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const [limit] = useState(20);

  const [loading, setLoading] = useState(false);
  const [data, setData] = useState({ items: [], total: 0, page: 1, limit });

  const [selected, setSelected] = useState(null);
  const [updating, setUpdating] = useState(false);

  const totalPages = useMemo(() => Math.max(1, Math.ceil((data?.total || 0) / limit)), [data, limit]);

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetchApplications({ status: status || undefined, q: q || undefined, page, limit });
      setData(res);
    } catch (e) {
      console.error(e);
      alert("שגיאה בטעינת הבקשות");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [status, page]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    load();
  };

  const handleQuickStatus = async (seller, newStatus) => {
    console.log("seler ",seller)
    if (!newStatus) return;
    setUpdating(true);
    try {
      await updateApplicationStatus(seller._id, { status: newStatus, note: "" });
      await load();
    } catch (e) {
      console.error(e);
      alert("עדכון סטטוס נכשל");
    } finally {
      setUpdating(false);
    }
  };

  const onUpdateStatusFromModal = async ({ status: newStatus, note }) => {
        console.log("seler ",selected)

    if (!selected) return;
    setUpdating(true);
    try {
      await updateApplicationStatus(selected._id, { status: newStatus, note });
      await load();
      setSelected(null);
    } catch (e) {
      console.error(e);
      alert("עדכון סטטוס נכשל");
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">בקשות למרקטפלייס</h1>

      <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-3 mb-4">
        <input
          type="text"
          className="border rounded p-2 flex-1"
          placeholder="חפש לפי שם/חברה/אימייל/טלפון…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <select className="border rounded p-2 w-full md:w-48" value={status}
                onChange={(e) => { setStatus(e.target.value); setPage(1); }}>
          <option value="">כל הסטטוסים</option>
          <option value="new">חדש</option>
          <option value="approved">מאושר</option>
          <option value="rejected">נדחה</option>
          <option value="suspended">מושהה</option>
        </select>
        <button className="bg-blue-900 text-white rounded px-4 py-2">סינון</button>
      </form>

      <AdminApplicationsTable
        items={data.items}
        loading={loading}
        onView={setSelected}
        onQuickStatus={handleQuickStatus}
        updating={updating}
      />

      {/* עימוד */}
      <div className="flex justify-between items-center mt-4">
        <div className="text-sm text-slate-600">
          סה״כ: {data.total} | עמוד {data.page} מתוך {totalPages}
        </div>
        <div className="flex gap-2">
          <button className="px-3 py-1 rounded bg-slate-200 hover:bg-slate-300 disabled:opacity-60"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1}>
            הקודם
          </button>
          <button className="px-3 py-1 rounded bg-slate-200 hover:bg-slate-300 disabled:opacity-60"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages}>
            הבא
          </button>
        </div>
      </div>

      {/* מודאל פרטים + עדכון */}
      <AdminApplicationDetails
        open={!!selected}
        onClose={() => setSelected(null)}
        seller={selected}
        onUpdateStatus={onUpdateStatusFromModal}
        updating={updating}
      />
    </div>
  );
}

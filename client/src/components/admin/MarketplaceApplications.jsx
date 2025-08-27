import { useEffect, useState } from "react";
import axios from "axios";
import RoleGate from "../../components/auth/RoleGate";

export default function MarketplaceApplications() {
  const api = axios.create({
    baseURL: "http://localhost:8080" ,
    withCredentials: true,
    timeout: 15000,
  });

  const [rows, setRows] = useState([]);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  const load = async () => {
    try {
      setBusy(true);
      const { data } = await api.get("/marketplace/admin/seller-applications");
      setRows(data?.rows || []);
      setMsg("");
    } catch (e) {
      setMsg(e?.response?.data?.message || "שגיאה בטעינה");
    } finally { setBusy(false); }
  };

  useEffect(() => { load(); }, []);

  const approve = async (id) => {
    try {
      setBusy(true);
      await api.patch(`/marketplace/admin/seller-applications/${id}/approve`);
      setMsg("הבקשה אושרה");
      await load();
    } catch (e) {
      setMsg(e?.response?.data?.message || "שגיאה באישור");
    } finally { setBusy(false); }
  };

  const reject = async (id) => {
    const reason = prompt("סיבת דחייה (אופציונלי):") || "";
    try {
      setBusy(true);
      await api.patch(`/marketplace/admin/seller-applications/${id}/reject`, { reason });
      setMsg("הבקשה נדחתה");
      await load();
    } catch (e) {
      setMsg(e?.response?.data?.message || "שגיאה בדחייה");
    } finally { setBusy(false); }
  };

  return (
    <RoleGate allow={["admin"]} mode="route" redirectTo="/account">
      <div className="max-w-6xl mx-auto p-4">
        <h1 className="text-2xl font-bold text-right mb-4">בקשות הצטרפות</h1>

        {msg && <div className="mb-3 text-sm text-right">{msg}</div>}
        {busy && <div className="h-10 animate-pulse bg-gray-100 rounded mb-3" />}

        <div className="overflow-auto border rounded-2xl">
          <table className="min-w-full text-right">
            <thead className="bg-gray-50">
              <tr>
                <th className="p-3">חברה</th>
                <th className="p-3">איש קשר</th>
                <th className="p-3">אימייל</th>
                <th className="p-3">טלפון</th>
                <th className="p-3">סטטוס</th>
                <th className="p-3">פעולות</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r._id} className="border-t">
                  <td className="p-3">{r.companyName}</td>
                  <td className="p-3">{r.fullName}</td>
                  <td className="p-3">{r.email}</td>
                  <td className="p-3">{r.phone || "—"}</td>
                  <td className="p-3">
                    <span className="rounded px-2 py-1 text-xs bg-gray-100">{r.status}</span>
                  </td>
                  <td className="p-3 space-x-reverse space-x-2">
                    <button
                      disabled={busy || r.status === "approved"}
                      onClick={() => approve(r._id)}
                      className="rounded-2xl bg-green-600 text-white px-3 py-1 text-sm disabled:opacity-50"
                    >
                      אישור
                    </button>
                    <button
                      disabled={busy || r.status === "rejected"}
                      onClick={() => reject(r._id)}
                      className="rounded-2xl bg-red-600 text-white px-3 py-1 text-sm disabled:opacity-50"
                    >
                      דחייה
                    </button>
                  </td>
                </tr>
              ))}
              {rows.length === 0 && !busy && (
                <tr><td colSpan={6} className="p-6 text-center text-gray-500">אין בקשות כרגע</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </RoleGate>
  );
}

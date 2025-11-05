// src/admin/MarketplaceApplications.jsx
import RoleGate from "../../components/auth/RoleGate";
import { useGetAdminSellerApplicationsSimpleQuery, useApproveAdminSellerApplicationMutation, useRejectAdminSellerApplicationMutation, } from "../../redux/services/adminApi";

export default function MarketplaceApplications() {
  const { data, isFetching, isError } = useGetAdminSellerApplicationsSimpleQuery();
  const rows = data?.rows || [];

  const [approve, { isLoading: approving }] = useApproveAdminSellerApplicationMutation();
  const [reject, { isLoading: rejecting }] = useRejectAdminSellerApplicationMutation();

  const busy = isFetching || approving || rejecting;

  const handleApprove = async (id) => {
    try {
      await approve(id).unwrap();
      alert("הבקשה אושרה");
    } catch (e) {
      alert(e?.data?.message || "שגיאה באישור");
      console.error(e);
    }
  };

  const handleReject = async (id) => {
    const reason = prompt("סיבת דחייה (אופציונלי):") || "";
    try {
      await reject({ id, reason }).unwrap();
      alert("הבקשה נדחתה");
    } catch (e) {
      alert(e?.data?.message || "שגיאה בדחייה");
      console.error(e);
    }
  };

  return (
    <RoleGate allow={["admin"]} mode="route" redirectTo="/account">
      <div className="max-w-6xl mx-auto p-4">
        <h1 className="text-2xl font-bold text-right mb-4">בקשות הצטרפות</h1>

        {isError && (
          <div className="mb-3 text-sm text-right text-red-600">שגיאה בטעינה</div>
        )}
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
                      onClick={() => handleApprove(r._id)}
                      className="rounded-2xl bg-green-600 text-white px-3 py-1 text-sm disabled:opacity-50"
                    >
                      אישור
                    </button>
                    <button
                      disabled={busy || r.status === "rejected"}
                      onClick={() => handleReject(r._id)}
                      className="rounded-2xl bg-red-600 text-white px-3 py-1 text-sm disabled:opacity-50"
                    >
                      דחייה
                    </button>
                  </td>
                </tr>
              ))}
              {rows.length === 0 && !busy && (
                <tr>
                  <td colSpan={6} className="p-6 text-center text-gray-500">
                    אין בקשות כרגע
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </RoleGate>
  );
}

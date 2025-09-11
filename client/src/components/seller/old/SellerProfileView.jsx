// components/seller/SellerProfileView.jsx
import { useEffect, useState } from "react";
import axios from "axios";

export default function SellerProfileView() {
  const [seller, setSeller] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const load = async () => {
    try {
      setErr("");
      setLoading(true);
      const { data } = await axios.get(
        "http://localhost:8080/seller-profile/me",
        { withCredentials: true }
      );
      setSeller(data?.seller || data);
    } catch (e) {
      setErr(e?.response?.data?.message || "שגיאה בטעינת פרופיל");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  if (loading) {
    return <div className="h-24 rounded-2xl bg-gray-100 animate-pulse" />;
  }

  if (err) {
    return (
      <div className="rounded-2xl border bg-white p-4">
        <div className="flex items-center justify-between">
          <p className="text-sm text-rose-600">{err}</p>
          <button
            onClick={load}
            className="rounded-xl bg-gray-900 px-3 py-1.5 text-xs text-white hover:bg-black"
          >
            נסי שוב
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border bg-white p-4">
      <h3 className="font-semibold mb-3">פרופיל מוכר</h3>
      <div className="flex items-start gap-4">
        <div className="h-20 w-20 border rounded-xl overflow-hidden bg-gray-50">
          {console.log(`http://localhost:8080${seller.logoUrl}`)}
          {seller?.logoUrl ? (
            <img src={`http://localhost:8080${seller.logoUrl}`} alt="logo" className="h-full w-full object-cover" />
          ) : (
            <div className="grid h-full w-full place-items-center text-xs text-gray-400">
              NO 
            </div>
          )}
        </div>

        <div className="text-sm text-gray-700 space-y-1">
          <div><b>שם עסק:</b> {seller?.businessName || "—"}</div>
          <div><b>שם תצוגה:</b> {seller?.displayName || "—"}</div>
          <div><b>אימייל:</b> {seller?.email || "—"}</div>
          <div><b>טלפון:</b> {seller?.phone || "—"}</div>
          {seller?.slug && (
            <div className="text-gray-500"><b>Slug:</b> /{seller.slug}</div>
          )}
          {seller?.status && (
            <div className="text-gray-500"><b>סטטוס:</b> {seller.status}</div>
          )}
        </div>
      </div>

      {/* כפתור רענון קטן */}
      <div className="mt-4">
        <button
          onClick={load}
          className="rounded-xl bg-gray-200 px-3 py-1.5 text-xs hover:bg-gray-300"
        >
          רענון
        </button>
      </div>
    </div>
  );
}

import { useState } from "react";

export default function SellerStatusForm({ initialStatus = "new", onSubmit, submitting }) {
  const [status, setStatus] = useState(initialStatus);
  const [note, setNote] = useState("");

  const handle = (e) => {
    e.preventDefault();
    onSubmit?.({ status, note });
  };

  return (
    <form className="space-y-3" onSubmit={handle}>
      <div className="grid grid-cols-1 gap-2">
        <label className="text-sm font-medium">סטטוס</label>
        <select className="border rounded p-2" value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="new">חדש</option>
          <option value="approved">מאושר</option>
          <option value="rejected">נדחה</option>
          <option value="suspended">מושהה</option>
        </select>
      </div>

      <div className="grid grid-cols-1 gap-2">
        <label className="text-sm font-medium">הערה (אופציונלי)</label>
        <textarea
          rows={3}
          className="border rounded p-2"
          placeholder="סיבה/הערה לנמען…"
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="w-full bg-blue-900 text-white py-2 rounded hover:bg-blue-800 disabled:opacity-60"
      >
        {submitting ? "מעדכן…" : "עדכון סטטוס"}
      </button>
    </form>
  );
}

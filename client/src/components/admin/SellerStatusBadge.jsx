export default function SellerStatusBadge({ status }) {
  const map = {
    new:       "bg-yellow-100 text-yellow-800",
    approved:  "bg-green-100 text-green-800",
    rejected:  "bg-red-100 text-red-800",
    suspended: "bg-gray-200 text-gray-800",
  };
  const cls = map[status] || "bg-slate-100 text-slate-800";
  const label = ({new:"חדש", approved:"מאושר", rejected:"נדחה", suspended:"מושהה"})[status] || status;
  return <span className={`px-2 py-1 rounded text-xs font-medium ${cls}`}>{label}</span>;
}

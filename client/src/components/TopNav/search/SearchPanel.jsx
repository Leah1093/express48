export default function SearchPanel({ open, children }) {
  if (!open) return null;
  return (
    <div
      data-search-panel="1"
      className="absolute z-[80] mt-2 w-[min(1120px,95vw)] right-0 left-0 mx-auto rounded-2xl bg-white shadow-[0_10px_32px_rgba(0,0,0,.08)] border border-gray-100 overflow-hidden"
      role="dialog"
      aria-label="תוצאות חיפוש"
    >
      {children}
    </div>
  );
}

import { useMemo, useState } from "react";

export default function SettingsTabs({ labels, initialActive = 0, children }) {
  const kids = useMemo(() => (Array.isArray(children) ? children : [children]), [children]);
  const [active, setActive] = useState(initialActive);
  const safeActive = active < kids.length ? active : kids.length - 1;

  return (
    <div className="space-y-4">
      <div className="flex gap-2 overflow-x-auto">
        {labels.map((lbl, i) => (
          <button
            key={i}
            type="button"
            className={`px-3 py-2 rounded-lg text-sm whitespace-nowrap ${i === safeActive ? "bg-slate-900 text-white" : "bg-white hover:bg-slate-100 border"}`}
            onClick={() => setActive(i)}
          >
            {lbl}
          </button>
        ))}
      </div>
      <div>{kids[safeActive]}</div>
    </div>
  );
}

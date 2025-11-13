import { ArrowUpLeft } from "./icons";

export default function ColumnList({
  title = "",                 // אופציונלי לכותרת עמודה
  items = [],                 // [{_id, name, active?:bool}]
  activeId = null,            // מי לחוץ עכשיו
  onSelect = () => {},        // לחיצה על פריט
  highlightOrange = true,     // האם לצבוע active בכתום
  className = "",
}) {
  return (
    <div className={`flex flex-col gap-4 bg-white p-10 pt-10 ${className}`} dir="rtl">
      {title ? (
        <div className="text-[16px] font-[400] leading-[120%] text-[#101010]">{title}</div>
      ) : null}

      <div className="flex flex-col gap-2">
        {items.map((it) => {
          const isActive = activeId === it._id || it.active;
          return (
            <button
              key={it._id}
              onClick={() => onSelect(it)}
              className="group w-full text-right"
            >
              <div
                className={`flex items-center justify-end gap-2 rounded-sm px-2 py-2`}
                style={{ background: "#F4F4F5" }} // ע"פ הפיגמה
              >
                <span
                  className="text-[16px] font-[400] leading-[120%]"
                  style={{
                    color: isActive && highlightOrange ? "#FF6500" : "#101010",
                    fontFamily: "Rubik, sans-serif",
                  }}
                >
                  {it.name}
                </span>
                <ArrowUpLeft className="shrink-0" stroke={isActive ? "#FF6500" : "#101010"} />
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

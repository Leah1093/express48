import { Fragment, useEffect, useMemo, useState } from "react";

const ArrowUpLeft = ({ className = "", stroke = "#101010" }) => (
  <svg
    className={className}
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 16 16"
    fill="none"
  >
    <path
      d="M13 13L3 3M3 3V10.5M3 3H10.5"
      stroke={stroke}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

// עמודת רשימה כללית (שורשים / שכבה 2)
function CategoryListColumn({
  titleVisuallyHidden = false,
  title = "",
  items = [],
  selectedId,
  onHover,
}) {
  return (
    <div className="flex flex-col gap-2">
      {!titleVisuallyHidden && title ? (
        <div className="sr-only">{title}</div>
      ) : null}

      <div className="flex flex-col min-w-[180px] bg-white">
        {items.map((it) => {
          const active = selectedId === it._id;
          return (
            <button
              key={it._id}
              type="button"
              onMouseEnter={() => onHover?.(it._id)}
              onFocus={() => onHover?.(it._id)}
              className={`flex items-center gap-2 justify-end px-3 py-2 rounded-sm ${
                active ? "bg-[#F4F4F5]" : "bg-[#F4F4F5]"
              }`}
            >
              <span
                className={`text-[16px] leading-[1.2] ${
                  active ? "text-[#FF6500]" : "text-[#101010]"
                }`}
              >
                {it.name}
              </span>
              <ArrowUpLeft stroke={active ? "#FF6500" : "#101010"} />
            </button>
          );
        })}
      </div>
    </div>
  );
}

// מפריד אנכי בין קבוצות בטור השלישי
function VerticalDivider() {
  return (
    <div
      className="hidden lg:block"
      style={{
        width: 1,
        height: 264,
        background: "#E2E8F0",
        alignSelf: "stretch",
      }}
    />
  );
}

// קבוצה בטור השלישי: כותרת (L3) + רשימת ילדים (L4)
function ThirdColumnGroup({ parent, children = [] }) {
  return (
    <div className="flex flex-col min-w-[166px]">
      <h4 className="text-right font-bold text-[16px] text-[#101010] mb-2">
        {parent?.name}
      </h4>
      <ul className="flex flex-col">
        {children.map((c) => (
          <li key={c._id}>
            <a
              href={`/products/${c.fullSlug}`}
              className="flex w-[166px] px-2 pr-2 py-1 justify-end items-center gap-2 text-right text-[16px] text-[#101010] hover:text-[#FF6500] transition-colors"
            >
              {c.name}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function CategoriesMegaPanel({
  anchorRef,
  roots,
  selectedRootId,
  onRootHover,
  level2,
  selectedSubId,
  onSubHover,
  treeFromL2,
  onClose,
}) {
  // חישוב מיקום – צמוד לניו
  const [top, setTop] = useState(132); // ברירת מחדל לפי הפיגמה
  useEffect(() => {
    const anchor = anchorRef?.current;
    if (!anchor) return;
    const rect = anchor.getBoundingClientRect();
    const y = Math.round(rect.bottom + window.scrollY);
    setTop(y);
  }, [anchorRef]);

  // בניית קבוצות לעמודה שלישית:
  // treeFromL2 = { _id, children:[ { ...L3, children:[L4...] } ] }
  const thirdColumnGroups = useMemo(() => {
    if (!treeFromL2 || !treeFromL2.children) return [];
    return treeFromL2.children.map((l3) => ({
      parent: l3,
      kids: Array.isArray(l3.children) ? l3.children : [],
    }));
  }, [treeFromL2]);

  // רספונסיביות: במובייל הפאנל הופך למודל מלא רוחב
  return (
    <>
      {/* שכבת השחרה */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/20 z-[40]"
        aria-hidden="true"
      />

      {/* הפאנל */}
      <div
        dir="rtl"
        className="absolute z-[41] right-[90px] md:right-[90px] left-2 md:left-auto"
        style={{ top }}
      >
        <div className="bg-white shadow-[0_8px_16px_0_rgba(35,38,59,0.25)] w-[95vw] max-w-[1171px] px-4 py-6 md:px-4 md:py-6">
          {/* גריד רספונסיבי: בטאבלט/דסקטופ 3 עמודות, במובייל נדחס לטורים */}
          <div className="grid grid-cols-1 md:grid-cols-[220px_220px_1fr] gap-4 md:gap-6">
            {/* עמודה 1 - שורשים */}
            <div className="bg-white p-0 md:p-0">
              <CategoryListColumn
                titleVisuallyHidden
                items={roots}
                selectedId={selectedRootId}
                onHover={onRootHover}
              />
            </div>

            {/* עמודה 2 - תתי קטגוריה (L2) */}
            <div className="bg-white">
              <CategoryListColumn
                titleVisuallyHidden
                items={level2}
                selectedId={selectedSubId}
                onHover={onSubHover}
              />
            </div>

            {/* עמודה 3 - קבוצות (L3 + L4) */}
            <div className="bg-[#F8FAFC] px-12 md:px-12 py-6 flex flex-wrap md:flex-nowrap items-start gap-6">
              {thirdColumnGroups.length === 0 ? (
                <div className="text-[#7A7474] text-sm">בחרי תת קטגוריה…</div>
              ) : (
                thirdColumnGroups.map((grp, idx) => (
                  <Fragment key={grp.parent._id}>
                    {idx > 0 && <VerticalDivider />}
                    <ThirdColumnGroup parent={grp.parent} children={grp.kids} />
                  </Fragment>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

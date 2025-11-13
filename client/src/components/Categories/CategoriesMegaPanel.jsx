import { Fragment, useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const byCatUrl = (fullSlug, page = 1, limit = 24) =>
  `/products/by-category/${fullSlug}?page=${page}&limit=${limit}`;

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

/**
 * Column עבור L1 / L2.
 *
 * - isLeafFn: פונקציה שמחזירה true אם הפריט הוא "עלה" (אין ילדים).
 * - leafAsClickable: אם true → עלים לחיצים ונווטים לעמוד הקטגוריה.
 * - hideArrowForLeaf: אם true → לעלים לא מציגים חץ.
 * - onLeafNavigate: ייקרא אחרי ניתוב של עלה (למשל כדי לסגור את הפאנל).
 */
function CategoryListColumn({
  items = [],
  selectedId,
  onHover,
  leafAsClickable = false,
  hideArrowForLeaf = false,
  isLeafFn,
  onLeafNavigate,
}) {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col gap-2" dir="rtl">
      {items.map((it) => {
        const active = String(selectedId) === String(it._id);
        const isLeaf = typeof isLeafFn === "function" ? !!isLeafFn(it) : false;

        const canNavigate = leafAsClickable && isLeaf && it.fullSlug;

        const handleClick = () => {
          if (canNavigate) {
            navigate(byCatUrl(it.fullSlug));
            onLeafNavigate?.();
          }
        };

        const showArrow = !(hideArrowForLeaf && isLeaf);

        return (
          <button
            key={it._id}
            type="button"
            onMouseEnter={() => onHover?.(it._id)}
            onFocus={() => onHover?.(it._id)}
            onClick={handleClick}
            className={`flex items-center justify-between ps-2 pe-2 py-2 rounded-sm transition-colors ${
              active ? "bg-[#F4F4F5]" : "bg-transparent hover:bg-[#F4F4F5]"
            }`}
          >
            <span
              className={`text-[1em] leading-[1.2] ${
                active ? "text-[#FF6500]" : "text-[#101010]"
              } ms-2`}
            >
              {it.name}
            </span>

            {showArrow && (
              <ArrowUpLeft
                className="shrink-0"
                stroke={active ? "#FF6500" : "#101010"}
              />
            )}
          </button>
        );
      })}
    </div>
  );
}

/** עמודת L3 + רשימת L4 (שתיהן לחיצות) */
function ThirdColumnGroup({
  parent,
  children = [],
  className = "",
  onNavigate,
}) {
  return (
    <div
      className={`flex flex-col min-w-[200px] max-w-full rounded relative px-0 ${className}`}
      dir="rtl"
    >
      <Link
        to={byCatUrl(parent?.fullSlug)}
        onClick={onNavigate}
        className="text-[#101010] hover:text-[#FF6500] transition-colors text-[1.125em] font-[700] leading-[1.2] tracking-[-0.02em] mb-2 text-right truncate pr-4"
        title={parent?.name}
      >
        {parent?.name}
      </Link>

      <ul className="flex flex-col gap-1 pr-4 max-h-[224px] overflow-y-auto">
        {children.map((c) => (
          <li key={c._id} className="min-w-0">
            <Link
              to={byCatUrl(c.fullSlug)}
              onClick={onNavigate}
              className="block pr-2 pl-2 py-1 text-[1em] leading-[1.2] font-[400] text-[#101010] hover:text-[#FF6500] transition-colors truncate"
              title={c.name}
            >
              {c.name}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function CategoriesMegaPanel({
  anchorRef,
  roots = [],
  selectedRootId,
  onRootHover,
  level2 = [],
  loadingL2,
  selectedSubId,
  onSubHover,
  treeFromL2,
  loadingTree,
  onClose,
  onMouseEnter,
  onMouseLeave,
}) {
  const [top, setTop] = useState(132);

  // האם ל-root הנוכחי יש לפחות L2 אחד עם ילדים (L3/L4)
  const [rootHasAnyTree, setRootHasAnyTree] = useState(false);

  useEffect(() => {
    const anchor = anchorRef?.current;
    if (!anchor) return;
    const rect = anchor.getBoundingClientRect();
    setTop(Math.round(rect.bottom + window.scrollY));
  }, [anchorRef]);

  // כשמחליפים root – מאפסים את הדגל
  useEffect(() => {
    setRootHasAnyTree(false);
  }, [selectedRootId]);

  // האם ל-L2 הנבחר כרגע יש עץ L3/L4
  const hasTreeForSelected = useMemo(() => {
    const kids = treeFromL2?.children;
    return Array.isArray(kids) && kids.length > 0;
  }, [treeFromL2]);

  // אם פעם אחת קיבלנו עץ עבור root זה – נסמן את הדגל
  useEffect(() => {
    if (hasTreeForSelected) {
      setRootHasAnyTree(true);
    }
  }, [hasTreeForSelected]);

  // all categories שיש לנו בתוך הפאנל (לבדיקת parentId)
  const allCatsInPanel = useMemo(() => {
    const arr = [];

    // L1
    if (Array.isArray(roots)) {
      arr.push(...roots);
    }

    // L2
    if (Array.isArray(level2)) {
      arr.push(...level2);
    }

    // L3 + L4 מתוך treeFromL2 (אם קיים)
    const l3 = Array.isArray(treeFromL2?.children) ? treeFromL2.children : [];
    l3.forEach((node) => {
      arr.push(node);
      if (Array.isArray(node.children)) {
        arr.push(...node.children);
      }
    });

    return arr;
  }, [roots, level2, treeFromL2]);

  // Set של כל ה־ids שיש להם ילדים לפי parentId
  const idsWithChildren = useMemo(() => {
    const s = new Set();
    allCatsInPanel.forEach((cat) => {
      const parentId = cat?.parentId;
      if (parentId) {
        s.add(String(parentId));
      }
    });
    return s;
  }, [allCatsInPanel]);

  // groups עבור L3/L4
  const groups = useMemo(() => {
    if (!hasTreeForSelected) return [];
    const kids = treeFromL2?.children || [];
    return kids.map((l3) => ({
      parent: l3,
      kids: Array.isArray(l3.children) ? l3.children : [],
    }));
  }, [treeFromL2, hasTreeForSelected]);

  return (
    <>
      {/* שכבת השחרה מתחת לניווט */}
      <div
        className="fixed left-0 right-0 bottom-0 bg-black/20 z-[40]"
        style={{ top }}
        onClick={onClose}
      />

      {/* הפאנל */}
      <div
        dir="rtl"
        className="absolute z-[41] right-[72px] left-2 md:right-[72px] md:left-2"
        style={{ top }}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
      >
        <div className="bg-white shadow-[0_8px_16px_0_rgba(35,38,59,0.25)] w-full max-w-[1328px] mx-auto overflow-hidden rounded text-[13px] sm:text-[14px] md:text-[15px] lg:text-[16px]">
          <div className="px-4 sm:px-6 md:px-8 lg:px-10 py-6">
            {/* grid:
               - אם יש לפחות L2 אחד עם ילדים → תמיד 3 עמודות (L1 + L2 + תוכן)
               - אחרת → 2 עמודות (L1 + רשימת L2 כקישורים)
            */}
            <div
              className={`grid gap-4 md:gap-6 ${
                rootHasAnyTree
                  ? "md:grid-cols-[240px_240px_1fr]"
                  : "md:grid-cols-[240px_1fr]"
              }`}
            >
              {/* עמודה 1 – L1 */}
              <div className="bg-white p-0 max-h-[52vh] overflow-y-auto rounded-sm">
                <CategoryListColumn
                  items={roots}
                  selectedId={selectedRootId}
                  onHover={onRootHover}
                  // L1 – תמיד עם חץ, לא לחיץ (ברירת מחדל של הקומפוננטה)
                />
              </div>

              {/* עמודה 2 – L2: קיימת רק אם יש root שיש בו עץ איפשהו */}
              {rootHasAnyTree && (
                <div className="bg-white p-0 max-h-[52vh] overflow-y-auto rounded-sm">
                  {loadingL2 ? (
                    <div className="p-4 text-sm text-gray-500">טוען...</div>
                  ) : (
                    <CategoryListColumn
                      items={level2}
                      selectedId={selectedSubId}
                      onHover={onSubHover}
                      // L2:
                      // אם זה leaf (אין לו ילדים לפי parentId) → לחיץ ובלי חץ
                      // אם זה לא leaf → עם חץ, לא לחיץ
                      leafAsClickable
                      hideArrowForLeaf={true}
                      isLeafFn={(it) => !it.hasChildren}
                      onLeafNavigate={onClose}
                    />
                  )}
                </div>
              )}

              {/* עמודה 3/2 – תוכן / fallback */}
              <div className="bg-[#F8FAFC] rounded-sm px-4 sm:px-6 md:px-8 lg:px-10 py-6">
                {loadingTree && (
                  <div className="text-sm text-gray-500">טוען...</div>
                )}

                {rootHasAnyTree ? (
                  hasTreeForSelected ? (
                    <>
                      {/* עד xl – עמודות לאורך עם קו רוחבי ביניהן */}
                      <div className="flex flex-col gap-0 xl:hidden">
                        {groups.map((grp, idx) => (
                          <ThirdColumnGroup
                            key={grp.parent._id}
                            parent={grp.parent}
                            children={grp.kids}
                            onNavigate={onClose}
                            className={
                              idx === 0
                                ? ""
                                : "border-t border-[#E2E8F0] mt-3 pt-3"
                            }
                          />
                        ))}
                      </div>

                      {/* מ-xl ומעלה – עמודות לרוחב עם קו אנכי ביניהן */}
                      <div className="hidden xl:flex xl:flex-row xl:flex-nowrap xl:items-start xl:gap-6">
                        {groups.map((grp, idx) => (
                          <ThirdColumnGroup
                            key={grp.parent._id}
                            parent={grp.parent}
                            children={grp.kids}
                            onNavigate={onClose}
                            className={
                              idx === 0
                                ? ""
                                : "border-r border-[#E2E8F0] pr-4 mr-4"
                            }
                          />
                        ))}
                      </div>
                    </>
                  ) : // אם ל-L2 הנבחר אין ילדים – לא מציגים כלום (בלי טקסט "אין תתי־קטגוריות")
                  null
                ) : (
                  // מצב מיוחד: לכל L2 אין ילדים → L2 מוצגים כקישורים (כמו L3/4)
                  <ul className="flex flex-col gap-1 pr-4 max-h-[224px] overflow-y-auto">
                    {loadingL2 ? (
                      <div className="text-sm text-gray-500">טוען...</div>
                    ) : level2.length > 0 ? (
                      level2.map((c) => (
                        <li key={c._id} className="min-w-0">
                          <Link
                            to={byCatUrl(c.fullSlug)}
                            onClick={onClose}
                            className="block pr-2 pl-2 py-1 text-[1em] leading-[1.2] font-[400] text-[#101010] hover:text-[#FF6500] transition-colors truncate"
                            title={c.name}
                          >
                            {c.name}
                          </Link>
                        </li>
                      ))
                    ) : // אין L2 בכלל – בלי הודעה
                    null}
                  </ul>
                )}
              </div>
            </div>

            <div className="h-1" />
          </div>
        </div>
      </div>
    </>
  );
}

import { useEffect, useMemo } from "react";
import ColumnList from "./ColumnList";
import DeepTreePanel from "./DeepTreePanel";
import {
  useGetRootCategoriesQuery,
  useGetCategoryChildrenQuery,
  useGetCategoryTreeQuery,
} from "../../redux/services/categoriesApi";

export default function CategoryDropdown({
  open,
  onClose,
  activeRootId,
  setActiveRootId,
  activeChildId,
  setActiveChildId,
  anchorLeft = 90,      // left: 90px מהפיגמה
  anchorTop = 132,      // top: 132px מהפיגמה
}) {
  // שורשים
  const { data: roots = [] } = useGetRootCategoriesQuery(undefined, { skip: !open });

  // ילדים של root נבחר
  const { data: children = [] } = useGetCategoryChildrenQuery(activeRootId, {
    skip: !open || !activeRootId,
  });

  // עץ עמוק (לשמאל) – מקס' 3 שכבות מתחת ל-root
  const { data: tree } = useGetCategoryTreeQuery(
    { id: activeRootId, maxDepth: 3 },
    { skip: !open || !activeRootId }
  );

  // אם נפתח – ודאי שיש activeRootId
  useEffect(() => {
    if (open && roots.length && !activeRootId) {
      setActiveRootId(roots[0]._id);
    }
  }, [open, roots, activeRootId, setActiveRootId]);

  // אם root משתנה – אפס child הבחירה
  useEffect(() => {
    setActiveChildId(null);
  }, [activeRootId, setActiveChildId]);

  // מיקום החלונית
  const panelStyle = useMemo(
    () => ({
      position: "absolute",
      left: `${anchorLeft}px`,
      top: `${anchorTop}px`,
      width: "1171px",
      background: "#FFF",
      boxShadow: "0 8px 16px 0 rgba(35, 38, 59, 0.25)",
      zIndex: 60,
    }),
    [anchorLeft, anchorTop]
  );

  if (!open) return null;

  return (
    <>
      {/* אוברליי אפור בהיר לכל המסך */}
      <div
        className="fixed inset-0 bg-black/20 z-50"
        onClick={onClose}
        aria-hidden
      />

      {/* החלונית הלבנה */}
      <div className="hidden lg:flex" style={panelStyle} dir="rtl">
        {/* עמודה 1: כל הקטגוריות הראשיות (roots) */}
        <ColumnList
          className="w-[280px]"
          title=""
          items={roots}
          activeId={activeRootId}
          onSelect={(c) => setActiveRootId(c._id)}
        />

        {/* עמודה 2: תתי קטגוריות של root */}
        <ColumnList
          className="w-[280px] border-r border-[#E5E7EB]"
          title=""
          items={children}
          activeId={activeChildId}
          onSelect={(c) => setActiveChildId(c._id)}
          highlightOrange={false} // כאן מעדיפים שחור כברירת מחדל
        />

        {/* פנל שמאלי: עץ עמוק */}
        <div className="flex-1">
          <DeepTreePanel tree={tree} />
        </div>
      </div>

      {/* מובייל/טאבלט: מסך מלא (פשוט יותר) */}
      <div className="lg:hidden fixed inset-x-0 top-[64px] bottom-0 bg-white z-60 overflow-y-auto" dir="rtl">
        <div className="p-4">
          <div className="text-[16px] font-[600] mb-2">קטגוריות</div>
          <div className="flex flex-col gap-3">
            {roots.map((r) => (
              <details key={r._id} open={r._id === activeRootId} className="bg-[#F4F4F5] rounded p-2">
                <summary
                  className="flex justify-between items-center cursor-pointer"
                  onClick={() => setActiveRootId(r._id)}
                >
                  <span className="text-[16px]">{r.name}</span>
                  <span className="text-[#7A7474]">▼</span>
                </summary>
                <div className="pl-3 pr-1 py-2 flex flex-col gap-2">
                  {/* ילדים */}
                  {/* במובייל נשתמש ב־children שכבר נטען ל־root הפעיל */}
                  {(r._id === activeRootId ? children : []).map((c) => (
                    <div key={c._id} className="text-[15px] text-[#101010]">
                      {c.name}
                    </div>
                  ))}
                </div>
              </details>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

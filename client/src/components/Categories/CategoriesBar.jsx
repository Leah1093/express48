import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import {
  useGetRootCategoriesQuery,
  useGetCategoryChildrenQuery,
  useGetCategoryTreeQuery,
} from "../../redux/services/categoriesApi";
import CategoriesMegaPanel from "./CategoriesMegaPanel.jsx";

const ChevronDown = ({ className = "" }) => (
  <svg
    className={className}
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 16 16"
    fill="none"
  >
    <path
      d="M12.6665 5.66675L7.6665 10.6667L2.6665 5.66675"
      stroke="#7A7474"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export default function CategoriesBar() {
  const [open, setOpen] = useState(false);
  const closeTimerRef = useRef(null);

  const openPanel = useCallback(() => {
    clearTimeout(closeTimerRef.current);
    setOpen(true);
  }, []);
  const scheduleClose = useCallback(() => {
    clearTimeout(closeTimerRef.current);
    closeTimerRef.current = setTimeout(() => setOpen(false), 120);
  }, []);
  const cancelClose = useCallback(
    () => clearTimeout(closeTimerRef.current),
    []
  );

  // Roots
  const { data: roots = [] } = useGetRootCategoriesQuery(undefined, {
    refetchOnFocus: false,
    refetchOnReconnect: false,
  });

  // Selection state
  const [rootHoverId, setRootHoverId] = useState(null);
  const [l2HoverId, setL2HoverId] = useState(null);

  const onRootHover = useCallback((id) => {
    setRootHoverId(id);
    setL2HoverId(null);
  }, []);
  const onL2Hover = useCallback((id) => setL2HoverId(id), []);

  // Level 2 (children of root)
  const { data: level2 = [], isFetching: fetchingL2 } =
    useGetCategoryChildrenQuery(rootHoverId, {
      skip: !rootHoverId,
      refetchOnFocus: false,
      refetchOnReconnect: false,
    });

  // בחירה אוטומטית של L2 הראשון
  useEffect(() => {
    if (rootHoverId && level2.length && !l2HoverId) {
      setL2HoverId(level2[0]._id);
    }
  }, [rootHoverId, level2, l2HoverId]);

  // ודא שה־L2 שייך לשורש הנוכחי
  const validSubId = useMemo(() => {
    if (!l2HoverId) return null;
    return level2.some((x) => String(x._id) === String(l2HoverId))
      ? l2HoverId
      : null;
  }, [level2, l2HoverId]);

  // Tree from L2
  const { data: treeFromL2, isFetching: fetchingTree } =
    useGetCategoryTreeQuery(
      { id: validSubId, maxDepth: 3 },
      { skip: !validSubId, refetchOnFocus: false, refetchOnReconnect: false }
    );

  const barRef = useRef(null);

  return (
    <div
      dir="rtl"
      className="w-full flex justify-center bg-[#FFF7F2]"
      onMouseLeave={scheduleClose}
      onMouseEnter={cancelClose}
    >
      <nav
        ref={barRef}
        className="
          w-full max-w-[1440px]
          flex items-center
          gap-3 sm:gap-[25px]
          px-3 sm:px-6 md:px-8
          py-3 md:py-6
          justify-start md:justify-center
          flex-nowrap
          overflow-x-auto
        "
      >
        {/* כל הקטגוריות */}
        <button
          type="button"
          className="text-[#FF6500] font-bold text-sm sm:text-[16px] leading-[1.2] whitespace-nowrap shrink-0"
          onMouseEnter={openPanel}
          onFocus={openPanel}
        >
          כל הקטגוריות
        </button>

        {/* Roots */}
        {roots.map((r) => {
          const active = rootHoverId === r._id && open;
          return (
            <button
              key={r._id}
              type="button"
              onMouseEnter={() => {
                openPanel();
                onRootHover(r._id);
              }}
              onFocus={() => {
                openPanel();
                onRootHover(r._id);
              }}
              className={`
                inline-flex items-center gap-1.5 sm:gap-2
                text-sm sm:text-[16px] leading-[1.2] transition-colors
                whitespace-nowrap ps-2 pe-0 shrink-0
                ${
                  active
                    ? "text-[#FF6500] font-bold"
                    : "text-[#7A7474] font-normal"
                }
              `}
              style={{ direction: "rtl" }}
            >
              <span className="order-1">{r.name}</span>
              <ChevronDown className="order-2 w-4 h-4 shrink-0" />
            </button>
          );
        })}
      </nav>

      {open && (
        <CategoriesMegaPanel
          anchorRef={barRef}
          roots={roots}
          selectedRootId={rootHoverId}
          onRootHover={onRootHover}
          level2={level2}
          loadingL2={fetchingL2}
          selectedSubId={validSubId}
          onSubHover={onL2Hover}
          treeFromL2={validSubId ? treeFromL2 : null}
          loadingTree={fetchingTree}
          onClose={scheduleClose}
          onMouseEnter={cancelClose}
          onMouseLeave={scheduleClose}
        />
      )}
    </div>
  );
}

import { useRef, useEffect, useState } from "react";
import { IoSearchOutline } from "react-icons/io5";
import { useNavigate } from "react-router-dom";
import {
  HiOutlineMagnifyingGlass,
  HiOutlineArrowUturnRight,
  HiMiniXMark,
} from "react-icons/hi2";
import SearchPanel from "./SearchPanel";
import { useSearch } from "../../../hooks/useSearch";

const buildProductPath = (p) => {
  if (!p) return null;
  if (typeof p?.url === "string" && p.url.startsWith("/products/")) return p.url;

  const storeSlug =
    p?.storeSlug ||
    p?.categorySlug ||
    p?.category?.slug ||
    (Array.isArray(p?.categories) && p.categories[0]?.slug);

  const productSlug =
    p?.productSlug ||
    p?.slug ||
    p?.seo?.slug ||
    p?.name?.trim()?.replace(/\s+/g, "-").toLowerCase();

  if (storeSlug && productSlug) return `/products/${storeSlug}/${productSlug}`;
  if (productSlug) return `/products/${productSlug}`;
  const id = p?._id || p?.id || p?.productId;
  if (id) return `/p/${id}`;
  return null;
};

function EmptyState({ message = "אופס, לא מצאנו תוצאות לחיפוש שלך" }) {
  return (
    <div className="flex items-center justify-center h-[260px]">
      <div className="text-center text-gray-400">
        <div className="mx-auto mb-3 h-12 w-12 rounded-full border-2 border-dashed grid place-items-center">
          <span className="text-2xl">×</span>
        </div>
        <div className="text-[14px]">{message}</div>
      </div>
    </div>
  );
}

export default function SearchBar({ className = "" }) {
  const {
    term,
    setTerm,
    suggestions,
    quickItems,
    loading,
    error,
    searchNow,
    recentSearches,
    removeFromHistory,
    addToHistory,
  } = useSearch({ suggestMin: 1, quickMin: 1, debounce: 250 });

  const [open, setOpen] = useState(false);
  const [touched, setTouched] = useState(false);
  const wrapRef = useRef(null);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  const listSuggestions = suggestions.length ? suggestions : recentSearches;

  const resetUI = (clear = false) => {
    if (clear) setTerm("");
    setOpen(false);
    setTouched(false);
    inputRef.current?.blur();
  };

  useEffect(() => {
    const onDocPointerDown = (e) => {
      const insideWrap = wrapRef.current?.contains(e.target);
      const path = typeof e.composedPath === "function" ? e.composedPath() : [];
      const insidePanel = Array.isArray(path) && path.some((el) => el?.dataset?.searchPanel === "1");
      if (!insideWrap && !insidePanel) resetUI(false);
    };
    document.addEventListener("pointerdown", onDocPointerDown);
    return () => document.removeEventListener("pointerdown", onDocPointerDown);
  }, []);

  const handleSubmit = async () => {
    const q = (term || "").trim();
    if (!q) return;
    setTouched(true);
    await searchNow(q);
    setOpen(true);
  };

  const chooseSuggestion = async (s) => {
    const q = (s || "").trim();
    if (!q) return;
    setTouched(true);
    setTerm(q);
    await searchNow(q);
    const hasResults = (Array.isArray(quickItems) && quickItems.length > 0) || (Array.isArray(suggestions) && suggestions.length > 0);
    if (hasResults) addToHistory(q);
    setOpen(true);
  };

  const chooseProduct = (p) => {
    const to = buildProductPath(p);
    if (!to) return;
    setTouched(true);
    if (p?.name) addToHistory(p.name);
    navigate(to);
    resetUI(true);
  };

  const viewAll = () => {
    const q = (term || "").trim();
    if (!q) return;
    navigate(`/search?q=${encodeURIComponent(q)}`);
    resetUI(false);
  };

  const hasText = term.trim().length > 0;
  const showRightColumn = open && (hasText || recentSearches.length > 0);

  return (
    <div ref={wrapRef} className={`relative ${className}`} dir="rtl" style={{ minWidth: 0 }}>
      <div className="flex items-center h-12 rounded-2xl border border-[#EDEDED] bg-white cursor-text hover:cursor-text focus-within:cursor-text">
        <input
          ref={inputRef}
          value={term}
          onFocus={() => setOpen(true)}
          onChange={(e) => {
            setTerm(e.target.value);
            if (e.target.value.length > 0) setTouched(true);
            setOpen(true);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") { e.preventDefault(); handleSubmit(); }
            if (e.key === "Escape") resetUI(false);
          }}
          placeholder="אני רוצה לקנות..."
          className="flex-1 h-11 px-4 bg-transparent outline-none text-[16px] leading-[20px] font-[400] text-[#101010] placeholder:text-[#9E9E9E]"
          style={{ fontFamily: "Rubik, sans-serif" }}
          aria-label="חיפוש מוצר"
        />
        <button
          type="button"
          onClick={handleSubmit}
          className="flex items-center justify-center mr-2 w-11 h-11 rounded-xl border border-[#FF6500] bg-[#FFF7F2]"
          aria-label="בצע חיפוש"
        >
          <IoSearchOutline className="w-6 h-6 text-[#FF6500]" />
        </button>
      </div>

      <SearchPanel open={open}>
        <div className="grid grid-cols-12 md:[direction:ltr]" data-search-panel="1">
          <div className="col-span-12 md:col-span-8 md:col-start-1 px-5 py-4 border-t md:border-t-0 text-right">
            <div className="text-sm text-gray-500 font-medium mb-2 text-center">מוצרים</div>
            {loading && !quickItems.length ? (
              <div className="py-14 text-center text-gray-400 text-sm">טוען…</div>
            ) : Array.isArray(quickItems) && quickItems.length ? (
              <>
                <div className="flex gap-4 overflow-x-auto pb-3">
                  {quickItems.map((p) => (
                    <div
                      key={p._id || p.id || p.slug}
                      className="shrink-0 w-60 rounded-2xl border border-gray-200 bg-white text-right transition hover:border-gray-300 hover:shadow-sm cursor-pointer"
                      onClick={() => chooseProduct(p)}
                      role="button"
                      tabIndex={0}
                      title={p?.name}
                    >
                      <div className="p-4 flex flex-col gap-3">
                        <div className="w-fit mx-auto">
                          <img
                            src={p.image || p.thumbnail || "/placeholder.png"}
                            alt={p.name || ""}
                            className="w-24 h-24 object-cover rounded-lg border mx-auto"
                            loading="lazy"
                          />
                        </div>
                        <div className="text-sm leading-5 line-clamp-2">{p.name}</div>
                        {typeof p.price === "number" && (
                          <div className="text-sm font-medium text-gray-700">₪ {p.price}</div>
                        )}
                        <div className="mt-1">
                          <span className="inline-block text-center text-xs rounded-lg px-3 py-1 border border-[#FF6500] text-[#FF6500]">
                            לצפייה
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-3">
                  <button
                    onClick={viewAll}
                    className="px-5 py-2 rounded-xl bg-[#101010] text-white text-sm font-medium"
                  >
                    לצפייה בכל המוצרים
                  </button>
                </div>
              </>
            ) : hasText || touched ? (
              <EmptyState />
            ) : (
              <div className="py-6" />
            )}
          </div>
          <div className="col-span-12 md:col-span-4 md:col-start-9 px-5 py-4 bg-white text-right">
            <div className="text-sm text-gray-500 font-medium mb-2 text-center">תוצאות מהירות</div>

            {!showRightColumn ? (
              <div className="text-sm text-gray-400 py-8">התחילי להקליד כדי לקבל הצעות…</div>
            ) : error ? (
              <div className="text-sm text-red-600 py-6">שגיאה בחיפוש</div>
            ) : listSuggestions.length ? (
              <ul className="space-y-1">
                {listSuggestions.map((s) => {
                  const isHistory = !suggestions.length;
                  const LeadingIcon = isHistory ? HiOutlineArrowUturnRight : HiOutlineMagnifyingGlass;
                  return (
                    <li key={s}>
                      <div className="flex items-center justify-between h-10 px-2 rounded hover:bg-gray-50">
                        <button
                          className="flex items-center gap-2 min-w-0 text-right"
                          onClick={() => chooseSuggestion(s)}
                          title={s}
                        >
                          <LeadingIcon className="w-4 h-4 shrink-0 text-gray-400" />
                          <span className="truncate text-sm">{s}</span>
                        </button>
                        {isHistory ? (
                          <button
                            className="p-1 rounded hover:bg-gray-100"
                            onClick={() => removeFromHistory(s)}
                            aria-label={`הסירי '${s}' מהיסטוריה`}
                          >
                            <HiMiniXMark className="w-4 h-4 text-gray-400" />
                          </button>
                        ) : (
                          <span className="w-5" />
                        )}
                      </div>
                    </li>
                  );
                })}
              </ul>
            ) : hasText || touched ? (
              <EmptyState />
            ) : (
              <div className="py-6" />
            )}
          </div>
        </div>
      </SearchPanel>
    </div>
  );
}

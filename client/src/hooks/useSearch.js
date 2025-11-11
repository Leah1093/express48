import { useEffect, useRef, useState } from "react";
import axios from "axios";

const API_BASE =
  (location.hostname === "localhost"
    ? "http://localhost:8080"
    : "https://api.express48.com") + "/api/search";

const includesCI = (txt = "", q = "") =>
  String(txt).toLowerCase().includes(String(q).toLowerCase());

const mapQuickItem = (x) => {
  const slug =
    x?.slug || x?.productSlug || x?.seo?.slug || x?.slugFull || x?.id;
  const categorySlug =
    x?.storeSlug ||
    x?.categorySlug ||
    x?.category?.slug ||
    (Array.isArray(x?.categoryPath) ? x.categoryPath[0] : undefined);

  return {
    ...x,
    slug,
    categorySlug,
    url:
      x?.url ||
      x?.href ||
      x?.link ||
      x?.path ||
      x?.permalink ||
      x?.seoPath ||
      x?.canonicalUrl ||
      x?.canonical ||
      x?.productUrl ||
      x?.seo?.url ||
      x?.seo?.path,
    image:
      x?.image ||
      x?.thumbnail ||
      x?.img ||
      x?.media?.[0]?.src ||
      x?.gallery?.[0]?.url,
    name: x?.name || x?.title,
    price: x?.price,
  };
};

export function useSearch({
  suggestMin = 1,
  quickMin = 1,
  debounce = 250,
} = {}) {
  const [term, setTerm] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [quickItems, setQuickItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [recentSearches, setRecentSearches] = useState(() => {
    try {
      const raw = JSON.parse(localStorage.getItem("recentSearches")) || [];
      return raw.filter((t) => typeof t === "string" && t.trim().length >= 2);
    } catch {
      return [];
    }
  });

  const cacheRef = useRef({});
  const controllerRef = useRef(null);

  const persistHistory = (arr) =>
    localStorage.setItem("recentSearches", JSON.stringify(arr));

  const addToHistory = (val) => {
    const t = (val || "").trim();
    if (t.length < 2) return; 
    setRecentSearches((prev) => {
      const next = [t, ...prev.filter((x) => x !== t)].slice(0, 10);
      persistHistory(next);
      return next;
    });
  };

  const removeFromHistory = (v) => {
    setRecentSearches((prev) => {
      const next = prev.filter((x) => x !== v);
      persistHistory(next);
      return next;
    });
  };

  const clearByLen = (q) => {
    const len = q.length;
    if (len < suggestMin) setSuggestions([]);
    if (len < quickMin) setQuickItems([]);
  };

  const normalizeSuggest = (data) => {
    if (Array.isArray(data)) return data;
    if (data && Array.isArray(data.suggestions)) return data.suggestions;
    return [];
  };

  const normalizeQuick = (data) => {
    const base = Array.isArray(data) ? data : data?.items || [];
    return base.map(mapQuickItem);
  };

  const fetchSearch = async (raw) => {
    const value = (raw || "").trim();

    if (!value) {
      setSuggestions([]);
      setQuickItems([]);
      return { ok: false, suggestions: [], quickItems: [] };
    }

    clearByLen(value);

    const cached = cacheRef.current[value];
    if (cached) {
      const sug = value.length >= suggestMin ? cached.suggestions : [];
      const qck = value.length >= quickMin ? cached.quickItems : [];
      setSuggestions(sug);
      setQuickItems(qck);
      const ok = sug.length + qck.length > 0;
      return { ok, suggestions: sug, quickItems: qck };
    }

    if (controllerRef.current) controllerRef.current.abort();
    controllerRef.current = new AbortController();

    const doSuggest = value.length >= suggestMin;
    const doQuick = value.length >= quickMin;

    if (!doSuggest && !doQuick) {
      setSuggestions([]);
      setQuickItems([]);
      return { ok: false, suggestions: [], quickItems: [] };
    }

    setLoading(true);
    setError("");

    try {
      const [sugRes, quickRes] = await Promise.all([
        doSuggest
          ? axios.get(`${API_BASE}/suggest`, {
              params: { q: value, limit: 8 },
              withCredentials: true,
              signal: controllerRef.current.signal,
            })
          : null,
        doQuick
          ? axios.get(`${API_BASE}/quick`, {
              params: { q: value, limit: 12 },
              withCredentials: true,
              signal: controllerRef.current.signal,
            })
          : null,
      ]);

      const next = {
        suggestions: normalizeSuggest(sugRes?.data),
        quickItems: normalizeQuick(quickRes?.data),
      };
      next.quickItems = next.quickItems.filter(
        (p) =>
          includesCI(p?.name, value) ||
          includesCI(p?.slug, value) ||
          includesCI(p?.categorySlug, value)
      );

      cacheRef.current[value] = next;

      const sug = doSuggest ? next.suggestions : [];
      const qck = doQuick ? next.quickItems : [];

      setSuggestions(sug);
      setQuickItems(qck);

      const ok = sug.length + qck.length > 0;
      return { ok, suggestions: sug, quickItems: qck };
    } catch (err) {
      if (err?.name !== "CanceledError" && err?.code !== "ERR_CANCELED") {
        console.error("search error:", err);
        setError("שגיאה בחיפוש");
      }
      return { ok: false, suggestions: [], quickItems: [] };
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const q = term.trim();
    const t = setTimeout(() => void fetchSearch(q), debounce);
    return () => clearTimeout(t);
  }, [term, suggestMin, quickMin, debounce]);

  const searchNow = (q) => fetchSearch(q);

  return {
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
  };
}

export default useSearch;

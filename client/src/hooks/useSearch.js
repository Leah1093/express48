import { useState, useEffect, useRef } from "react";
import axios from "axios";

export function useSearch({ minLength = 2, debounce = 600 } = {}) {
    const [term, setTerm] = useState("");
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [recentSearches, setRecentSearches] = useState(() => {
        try {
            return JSON.parse(localStorage.getItem("recentSearches")) || [];
        } catch {
            return [];
        }
    });

    const cache = useRef({});
    const controllerRef = useRef(null);

    // debounce
    useEffect(() => {
        if (term.trim().length < minLength) {
            setResults([]);
            return;
        }

        const delay = setTimeout(() => {
            search(term, false); // לא לשמור להיסטוריה
        }, debounce);

        return () => clearTimeout(delay);
    }, [term]);

    const search = async (query, saveToHistory = true) => {
        const value = query.trim();
        if (!value) return;

        // cache
        if (cache.current[value] && cache.current[value].length > 0) {
            
            setResults(cache.current[value]);
            if (saveToHistory) updateHistory(value);
            return;
        }

        // cancel request
        if (controllerRef.current) {
            controllerRef.current.abort();
        }
        controllerRef.current = new AbortController();

        setLoading(true);
        setError("");

        try {
            const res = await axios.get("http://localhost:8080/products/search", {
                params: { search: value },
                signal: controllerRef.current.signal,
            });

            const items = res.data.items || [];

            setResults(items);
            cache.current[value] = items;

            if (saveToHistory) updateHistory(value);
        } catch (err) {
            if (err.name !== "CanceledError") {
                setError("שגיאה בחיפוש");
            }
        } finally {
            setLoading(false);
        }
    };

    const updateHistory = (value) => {
        const updated = [value, ...recentSearches.filter((i) => i !== value)].slice(0, 5);
        setRecentSearches(updated);
        localStorage.setItem("recentSearches", JSON.stringify(updated));
    };

    const removeFromHistory = (value) => {
        const updated = recentSearches.filter((i) => i !== value);
        setRecentSearches(updated);
        localStorage.setItem("recentSearches", JSON.stringify(updated));
    };


    return {
        term,
        setTerm,
        results,
        loading,
        error,
        searchNow: search,
        recentSearches,
        removeFromHistory,
    };
}

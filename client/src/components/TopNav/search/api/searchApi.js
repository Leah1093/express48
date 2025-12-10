const API = import.meta.env.VITE_API_URL ?? "http://localhost:8080";

export async function fetchSuggest(q, { signal } = {}) {
  if (!q?.trim()) return [];
  const res = await fetch(
    `${API}/search/suggest?q=${encodeURIComponent(q)}`,
    { signal, credentials: "include" }
  );
  if (!res.ok) throw new Error("suggest failed");
  return res.json(); // מחזיר { suggestions: [...] }
}

export async function fetchQuick(q, { signal } = {}) {
  if (!q?.trim()) return [];
  const res = await fetch(
    `${API}/search/quick?q=${encodeURIComponent(q)}&limit=4`,
    { signal, credentials: "include" }
  );
  if (!res.ok) throw new Error("quick failed");
  return res.json(); // מחזיר { items: [...] }
}

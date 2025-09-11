export function abs(u) {
  if (!u) return "";
  if (/^https?:\/\//i.test(u)) return u;
  const origin = import.meta.env.VITE_BACKEND_ORIGIN || "";
  return `${origin}${u.startsWith("/") ? u : `/${u}`}`;
}

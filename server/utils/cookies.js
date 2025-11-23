const isProd = process.env.NODE_ENV === "production";
const domain = isProd ? process.env.COOKIE_DOMAIN : undefined; // למשל: .express48.co.il

export const cookieNames = {
  access: "access_token",
  refresh: "refresh_token",
  //בהמשך 
  // אופציונלי: csrf: "csrf_token",
};
//הגדרות טוקן קצר
export function accessCookieOpts() {
  return {
    httpOnly: true,
    secure: isProd,
    sameSite: "Lax",
    domain,
    path: "/",
    maxAge: parseTtlMs(process.env.ACCESS_TOKEN_TTL || "60m"),
  };
}
//הגדרון טוקן ארוך
export function refreshCookieOpts() {
  return {
    httpOnly: true,
    secure: isProd,
    sameSite: "Strict",
    domain,
    path: "/entrance/refresh", // מצמצם אקפוז'ר
    maxAge: parseTtlMs(process.env.REFRESH_TOKEN_TTL || "30d"),
  };
}
//מחיקה בטוחה של access_token
export function clearCookieOpts() {
  const base = isProd ? { secure: true, sameSite: "Lax", domain } : { sameSite: "Lax" };
  return { ...base, httpOnly: true, path: "/", maxAge: 0 };
}

// מחיקה בטוחה של refresh_token.
export function clearRefreshCookieOpts() {
  const base = isProd ? { secure: true, sameSite: "Strict", domain } : { sameSite: "Lax" };
  return { ...base, httpOnly: true, path: "/entrance/refresh", maxAge: 0 };
}
//תרגום זמן
function parseTtlMs(ttl) {
  if (/^\d+$/.test(ttl)) return Number(ttl) * 1000;
  const m = ttl.match(/^(\d+)([smhd])$/i);
  if (!m) return 15 * 60 * 1000;
  const n = Number(m[1]);
  const map = { s: 1000, m: 60000, h: 3600000, d: 86400000 };
  return n * map[m[2].toLowerCase()];
}

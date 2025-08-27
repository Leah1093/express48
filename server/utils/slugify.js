// utils/slug.js
export const isValidSlug = (s) => /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(s);

// ליצירה אוטומטית: תומך בעברית via transliterateHebrew
import { transliterateHebrew } from "./transliterate.js";
export function slugifyName(name = "") {
  const hasLatin = /[a-z]/i.test(name);
  const base = hasLatin ? name : transliterateHebrew(name);
  return base
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

// לעדכון ידני: אנגלית בלבד, ללא טרנסליטרציה
export function normalizeUserSlug(desired = "") {
  const s = String(desired).trim().toLowerCase();
  if (!isValidSlug(s)) throw new Error("Slug לא תקין (אנגלית/ספרות ומקפים בלבד)");
  return s;
}

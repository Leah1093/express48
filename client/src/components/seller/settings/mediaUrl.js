// src/utils/mediaUrl.js
import { API_BASE_URL } from "./storeApi";



export function mediaUrl(u) {
  if (!u) return "";
  const s = String(u);
  if (s.startsWith("blob:") || s.startsWith("data:") || /^https?:\/\//i.test(s)) return s;
  return API_BASE_URL.replace(/\/+$/, "") + (s.startsWith("/") ? s : "/" + s);
}
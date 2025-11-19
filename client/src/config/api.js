// ========================================
// API Configuration
// ========================================
// שימוש ב-VITE_API_URL מ-.env או fallback לשרת המקומי
export const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

console.log("🔧 API_BASE_URL configured:", API_BASE_URL);

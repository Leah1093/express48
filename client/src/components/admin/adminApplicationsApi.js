import axios from "axios";

const api = axios.create({
  baseURL:  "https://api.express48.com",
  withCredentials: true,
});

// רשימת בקשות/מוכרים
export async function fetchApplications({ status, q, page = 1, limit = 20 }) {
  const res = await api.get("marketplace/admin/sellers", { params: { status, q, page, limit } });
  return res.data; // { success, items, total, page, limit }
}

// (אופציונלי) שליפה לפי id אם תרצי עמוד נפרד
export async function fetchApplicationById(id) {
  const res = await api.get(`marketplace/admin/sellers`, { params: { id } });
  return res.data;
}

// עדכון סטטוס
export async function updateApplicationStatus(id, { status, note = "" }) {
  const res = await api.patch(`marketplace/admin/sellers/${id}/status`, { status, note });
  return res.data; // { success, seller }
}

export default api;

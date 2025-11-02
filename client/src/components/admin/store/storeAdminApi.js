// src/admin/storeAdminApi.js
import axios from "axios";
export const API_BASE_URL = "https://api.express48.com";

const api = axios.create({
  baseURL: API_BASE_URL + "/",
  withCredentials: true,
});

// שליפת חנות ע"י מזהה (אדמין)
export async function adminGetStoreById(id) {
  const res = await api.get(`seller-store/admin/${id}`);
  return res.data;
}

// עדכון סטטוס (אדמין)
export async function adminUpdateStoreStatus(id, { status, note = "" }) {
  const res = await api.patch(`seller-store/admin/${id}/status`, { status, note });
  return res.data;
}

// עדכון סלוג (אדמין) — מקבל סלוג מפורש מהאדמין
export async function adminUpdateStoreSlug(id, { slug }) {
  const res = await api.put(`seller-store/admin/${id}/slug`, { slug });
  return res.data; // מחזיר store או { slug }
}

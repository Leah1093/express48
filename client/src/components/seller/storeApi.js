import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/marketplace",
  withCredentials: true,
});

export async function getMyStore() {
  const { data } = await api.get("/seller/store");
  return data?.store || null;
}

export async function saveMyStore(payload) {
  const { data } = await api.put("/seller/store", payload);
  return data?.store;
}

export default api;

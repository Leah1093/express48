import axios from "axios";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "https://api.express48.com",
  withCredentials: true, // חשוב ל־HTTP-Only Cookies
});

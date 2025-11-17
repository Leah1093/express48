import axios from 'axios';

// הגדרה גלובלית של axios
axios.defaults.baseURL = import.meta.env.VITE_API_URL || 'http://localhost:8080';
axios.defaults.withCredentials = true; // חשוב! שולח cookies בכל בקשה

// Interceptor לטיפול בשגיאות
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.log('[AXIOS] 401 Unauthorized - ייתכן שצריך התחברות');
      // אפשר להפנות ל-login אם צריך
      // window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default axios;

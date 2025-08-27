// // src/storeApi.js
// import axios from "axios";

// // יצירת instance עם הגדרות כלליות
// const api = axios.create({
//     baseURL: "http://localhost:8080/",
//     withCredentials: true,
    
//     // headers: { "Content-Type": "application/json" },
// });

// // שליפה של החנות שלי
// export async function getMyStore() {
//     console.log("getMyStore")
//     const res = await api.get("seller-store/me");
//     console.log("getMyStore 100")

//     return res.data;
// }

// // שמירה/עדכון של החנות שלי
// export async function saveMyStore(payload) {
//     console.log("saveMyStore", payload)

//     const res = await api.put("seller-store/me", payload);
//     return res.data;
// }

// src/storeApi.js
import axios from "axios";

// כתובת בסיס לשרת ה-API (שמשמשת גם לבניית כתובות מדיה מוחלטות)
export const API_BASE_URL = "http://localhost:8080";

const api = axios.create({
  baseURL: API_BASE_URL + "/",
  withCredentials: true,
});

// שליפה של החנות שלי
export async function getMyStore() {
  const res = await api.get("seller-store/me");
  return res.data;
}




// שמירה/עדכון של החנות שלי (JSON בלבד)
export async function saveMyStore(payload) {
  const res = await api.put("seller-store/me", payload);
  return res.data;
}

// src/storeApi.js
export async function updateMySlug(slug) {
  if (!slug) throw new Error("חסר סלוג לעדכון");
  const res = await api.put("seller-store/me/slug", { slug });
  return res.data; // { success, slug }
}



// פרסום חנות (יציאה מ־draft)
export async function publishStore() {
  const res = await api.put("seller-store/me/status", { status: "active" });
  return res.data;
}


// העלאת כל המדיה בבקשה אחת
export async function uploadStoreMedia({ bannerTypeStore, bannerTypeList, replaceSlider = false, files }) {
  // files = { logo, storeBanner, mobileBanner, listBanner, slider: File[] }
  const fd = new FormData();
  fd.append("bannerTypeStore", bannerTypeStore || "static");
  fd.append("bannerTypeList", bannerTypeList || "static");
  fd.append("replaceSlider", replaceSlider ? "true" : "false");

  if (files?.logo) fd.append("logo", files.logo);
  if (files?.storeBanner) fd.append("storeBanner", files.storeBanner);
  if (files?.mobileBanner) fd.append("mobileBanner", files.mobileBanner);
  if (files?.listBanner) fd.append("listBanner", files.listBanner);
  (files?.slider || []).forEach((f) => fd.append("slider", f));

  const res = await api.post("seller-store/me/media", fd, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
}

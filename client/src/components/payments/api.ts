// מייבאות טיפוסים כדי לקבל הקלדות חכמות ולהימנע משגיאות
import type {
  CreateCheckoutRequest,   // טיפוס בקשה ליצירת צ'קאאוט
  CreateCheckoutResponse,  // טיפוס תגובה ליצירת צ'קאאוט
  FetchResultResponse      // טיפוס תגובת תוצאה למסך תודה
} from "./types";          // מקור הטיפוסים הוא types.ts

// פונקציה ששולחת לשרת בקשה ליצור דף/קישור תשלום
export async function createCheckout(orderId: string, amount: number) { // מקבלת מזהה וסכום
  const body: CreateCheckoutRequest = { orderId, amount };              // מכינה גוף בקשה לפי טיפוס
  const res = await fetch("/api/payments/checkout", {                   // פונה לנתיב השרת
    method: "POST",                                                     // בקשת POST
    headers: { "Content-Type": "application/json" },                    // מצהירה ששולחת JSON
    credentials: "include",                                             // שולחת קוקיז אם יש
    body: JSON.stringify(body),                                         // ממירה את הגוף למחרוזת JSON
  });                                                                   // סוף fetch
  if (!res.ok) throw new Error("checkout failed");                      // במקרה תקלה – נזרוק שגיאה
  return res.json() as Promise<CreateCheckoutResponse>;                 // נחזיר את ה-JSON כטיפוס הידוע
}

// פונקציה שבודקת תוצאת עסקה עבור מסך "תודה"
export async function fetchResult(tx: string, rv: string) {             // מקבלת מזהי עסקה/חזרה
  const url = `/api/payments/result?tx=${encodeURIComponent(tx)}&rv=${encodeURIComponent(rv)}`; // בונה URL עם פרמטרים
  const res = await fetch(url, { credentials: "include" });             // מביאה תוצאה מהשרת (עם קוקיז)
  if (!res.ok) throw new Error("result failed");                        // בודקת כשל
  return res.json() as Promise<FetchResultResponse>;                    // מחזירה JSON מטוּפֵּס כטיפוס מוגדר
}

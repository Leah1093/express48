// הוק עזר לקריאת פרמטרים מה-URL (react-router-dom)
import { useSearchParams } from "react-router-dom"; // מייבאת הוק מובנה של ראוטר

// הוק שמחזיר את tx/rv מה-URL בצורה נוחה
export function usePaymentQuery() {               // יוצר הוק בשם usePaymentQuery
  const [sp] = useSearchParams();                 // שולף אובייקט פרמטרים מהכתובת
  const tx = sp.get("tx") || sp.get("InternalDealNumber") || ""; // מחפש מזהה עסקה בשמות נפוצים
  const rv = sp.get("rv") || sp.get("ReturnValue") || "";        // מחפש returnValue בשמות נפוצים
  return { tx, rv };                               // מחזיר אובייקט מסודר לשימוש בדפים
}

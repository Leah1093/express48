import { useEffect, useState } from "react";         // סטייט ואפקטים
import { fetchResult } from "../api";                // פונקציה ששואלת את השרת על התוצאה
import type { PaymentStatus } from "../types";       // טיפוס סטטוס
import { usePaymentQuery } from "../hooks";          // הוק שמביא tx/rv מה-URL

export default function ThankYou() {                 // דף תודה
  const { tx, rv } = usePaymentQuery();              // שליפת מזהים מה-URL (tx, rv)
  const [status, setStatus] = useState<PaymentStatus>("pending"); // סטטוס התשלום שמוצג למשתמש
  const [error, setError] = useState<string | null>(null);        // שגיאה להצגה אם משהו נכשל

  useEffect(() => {                                  // אפקט שרץ כשיש tx/rv
    if (!tx || !rv) return;                          // אם חסרים פרמטרים – אין מה לעשות
    let cancelled = false;                           // דגל ביטול כדי למנוע setState אחרי unmount

    fetchResult(tx, rv)                              // שואל את השרת על התוצאה
      .then(r => { if (!cancelled) setStatus(r.status); }) // מעדכן סטטוס אם הקומפוננטה עדיין על המסך
      .catch(() => { if (!cancelled) setError("שגיאה בבדיקת התשלום"); }); // תופס שגיאה ידידותית

    return () => { cancelled = true; };              // פונקציית ניקוי – מסמן שהתבטל
  }, [tx, rv]);                                      // תלוי במזהים – ירוץ כשישתנו

  return (                                           // JSX של הדף
    <div style={{ padding: 24 }}>                    {/* מעט ריווח פנימי */}
      <h1>תודה</h1>                                  {/* כותרת */}
      {!tx || !rv ? (                                // אם אין מזהים – נציג הודעה מתאימה
        <p>חזרנו ללא פרטי עסקה. אם שילמת, אנא בדקי היסטוריית הזמנות.</p>
      ) : error ? (                                  // במקרה שגיאה – מציגים
        <p>{error}</p>
      ) : (                                          // אחרת – מציגים סטטוס
        <p>סטטוס תשלום: <strong>{status}</strong></p>
      )}
    </div>
  );
}

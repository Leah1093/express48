import { useState } from "react";                 // כדי לנהל מצב טעינה
import { createCheckout } from "../api";          // פונקציה שדואגת לקריאת השרת
import type { PayButtonProps } from "../types";   // טיפוסי פרופס

export default function PayButton({ orderId, amount }: PayButtonProps) { // מקבלת מזהה וסכום
  const [loading, setLoading] = useState(false);  // סטייט לטעינה (מונע לחיצה כפולה)

  return (                                        // JSX של הכפתור
    <button
      disabled={loading}                           // נטרל כפתור בזמן טעינה
      onClick={async () => {                       // אירוע לחיצה אסינכרוני
        setLoading(true);                          // מפעיל "טעינה"
        try {                                      // בלוק ניסיון
          const { paymentUrl } = await createCheckout(orderId, amount); // מבקש מהשרת קישור תשלום
          window.location.href = paymentUrl;       // מפנה את הדפדפן לכתובת (ב-MOCK זה מסך דמה)
        } finally {                                // קורה תמיד – גם אם הצליח וגם אם נכשל
          setLoading(false);                       // מכבה "טעינה"
        }
      }}
      style={{ padding: "12px 18px", fontSize: 16 }} // קצת עיצוב בסיסי לנראות
    >
      {loading ? "מכין תשלום..." : "שלם עכשיו"}    {/* טקסט משתנה לפי מצב טעינה */}
    </button>
  );
}

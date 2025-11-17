import { useMemo } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";

// יוצר מזהה עסקה דמה כל פעם שנכנסים למסך
function makeTxId(suffix: string) {
  const rand = Math.random().toString(36).slice(2, 8);
  return `MOCK-${rand}${suffix}`;
}

export default function MockPay() {
  const [sp] = useSearchParams();
  const navigate = useNavigate();

  const rv = sp.get("rv") || "";
  const amt = sp.get("amt") || "";

  // מייצרים מזהי עסקה שונים כדי להדגים
  const txSuccess = useMemo(() => makeTxId("a"), []); // מסתיים ב-a (בדוגמה שלנו זה "שולם")
  const txCancel = useMemo(() => makeTxId("x"), []);  // מסתיים ב-x (בדוגמה שלנו זה "בוטל")

  return (
    <div style={{ padding: 24 }}>
      <h1>Mock Pay</h1>
      <p>ReturnValue: <code>{rv || "(חסר)"}</code></p>
      <p>Amount: <code>{amt || "(חסר)"}</code></p>

      <div style={{ display: "flex", gap: 12, marginTop: 16 }}>
        <button
          onClick={() => {
            // הצלחה – מעבירים את tx וה-rv לדף thank you
            navigate(`/pay/success?tx=${encodeURIComponent(txSuccess)}&rv=${encodeURIComponent(rv)}`);
          }}
          style={{ padding: "10px 14px" }}
        >
          סימולציית תשלום מוצלח
        </button>

        <button
          onClick={() => {
            // ביטול/כשל – מעבירים רק rv
            navigate(`/pay/cancel?rv=${encodeURIComponent(rv)}`);
          }}
          style={{ padding: "10px 14px" }}
        >
          ביטול/כשל
        </button>
      </div>

      <p style={{ marginTop: 20, fontSize: 12, color: "#666" }}>
        זהו מסך דמה בלבד לצורכי פיתוח. כאשר יתחבר השרת לספק אמיתי, הדפדפן יופנה לעמוד תשלום חיצוני במקום למסך הזה.
      </p>
    </div>
  );
}

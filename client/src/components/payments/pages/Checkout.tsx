import PayButton from "../components/PayButton";   // מביאה את כפתור התשלום

export default function Checkout() {               // דף קופה
  const fakeOrderId = "ORDER-123";                 // מזהה הזמנה דמה (אצלך תשלפי מהסטור/DB)
  const amount = 249.9;                            // סכום דמה לתשלום

  return (                                         // JSX של הדף
    <div style={{ padding: 24 }}>                  {/* מעט ריווח פנימי */}
      <h1>Checkout</h1>                            {/* כותרת הדף */}
      <p>סכום לתשלום: {amount} ₪</p>              {/* מציגים את הסכום */}
      <PayButton orderId={fakeOrderId} amount={amount} /> {/* כפתור שמתחיל את הזרימה */}
    </div>
  );
}

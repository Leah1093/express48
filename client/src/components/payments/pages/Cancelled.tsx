export default function Cancelled() {                // דף ביטול/כשל
  return (                                           // JSX פשוט
    <div style={{ padding: 24 }}>                    {/* מעט ריווח פנימי */}
      <h1>עסקה בוטלה</h1>                           {/* כותרת */}
      <p>לא בוצע חיוב. אפשר לנסות שוב בכל עת.</p>  {/* הודעת הסבר */}
    </div>
  );
}

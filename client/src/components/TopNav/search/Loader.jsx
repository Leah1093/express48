// client/src/components/TopNav/search/Loader.jsx
export default function Loader({
  label = "טוען נתונים",
  size = 60,          // גודל המסגרת הכללית (px)
  dotSize,            // אופציונלי: גודל נקודה ידני (px)
  className = "",
}) {
  const d = typeof dotSize === "number" ? dotSize : Math.max(6, Math.round(size / 6));

  return (
    <div
      className={`flex flex-col items-center justify-center ${className}`}
      role="status"
      aria-live="polite"
    >
      {/* מיכל הנקודות */}
      <div
        className="e48-loader"
        style={{ "--size": `${size}px`, "--dot": `${d}px` }}
      >
        <span />
        <span />
        <span />
        <span />
      </div>

      {/* כיתוב לפי הפיגמה */}
      <div
        className="mt-3 text-[14px]"
        style={{
          fontFamily: "Rubik, sans-serif",
          color: "#101010",
          lineHeight: "1.2",
          fontWeight: 400,
        }}
      >
        {label}
      </div>

      {/* ה־CSS של האנימציה (Self-contained, בלי תלות חיצונית) */}
      <style>{`
        .e48-loader {
          position: relative;
          width: var(--size);
          height: var(--size);
        }
        .e48-loader span {
          position: absolute;
          top: calc(50% - var(--dot) / 2);
          left: calc(50% - var(--dot) / 2);
          width: var(--dot);
          height: var(--dot);
          border-radius: 9999px;
          background: #FF6500;
          transform-origin: 0 0;
          animation: e48-orbit 1.2s linear infinite;
          box-shadow: 0 0 0 0 rgba(0,0,0,0.06);
        }
        .e48-loader span:nth-child(1) { animation-delay: 0s;    background: #FF6500; }
        .e48-loader span:nth-child(2) { animation-delay: -0.15s; background: #FF7F33; }
        .e48-loader span:nth-child(3) { animation-delay: -0.30s; background: #FFA266; }
        .e48-loader span:nth-child(4) { animation-delay: -0.45s; background: #FFC099; }

        @keyframes e48-orbit {
          0%   { transform: rotate(0deg)   translateX(calc(var(--size) / 3)) rotate(0deg); }
          100% { transform: rotate(360deg) translateX(calc(var(--size) / 3)) rotate(-360deg); }
        }
      `}</style>
    </div>
  );
}

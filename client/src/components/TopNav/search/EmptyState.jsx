export default function EmptyState({
  title = "אופס, לא מצאנו תוצאות לחיפוש שלך",
  subtitle = "",
  className = "",
}) {
  return (
    <div
      className={`w-full h-[260px] flex flex-col items-center justify-center text-[#101010] ${className}`}
      dir="rtl"
    >
      <svg width="58" height="58" viewBox="0 0 58 58" fill="none"
           xmlns="http://www.w3.org/2000/svg" className="mb-4">
        <circle cx="26" cy="26" r="16" stroke="#9E9E9E" strokeWidth="3"/>
        <line x1="39.5" y1="39.5" x2="56" y2="56"
              stroke="#9E9E9E" strokeWidth="3" strokeLinecap="round"/>
        {/* X קטן בפנים */}
        <line x1="19" y1="19" x2="33" y2="33" stroke="#FF6500" strokeWidth="3" strokeLinecap="round"/>
        <line x1="33" y1="19" x2="19" y2="33" stroke="#FF6500" strokeWidth="3" strokeLinecap="round"/>
      </svg>

      <div className="text-[14px] leading-[1.2] font-[400] text-center max-w-[210px]">
        {title}
      </div>
      {subtitle ? (
        <div className="mt-1 text-[12px] text-[#9E9E9E]">{subtitle}</div>
      ) : null}
    </div>
  );
}

import DOMPurify from "dompurify";

export default function ProductOverview({ overview, description, warranty }) {
  const hero =
    overview?.images ||
    (Array.isArray(overview?.images) ? overview.images[0] : null);

  return (
    <div className="flex flex-col items-start gap-6 w-full bg-white p-6 border border-[#EDEDED] rounded-lg">
      <div
        className="
    text-[#101828] text-right leading-[1.2] w-full
    [direction:rtl] [unicode-bidi:plaintext]
    [&_ul]:list-disc [&_ol]:list-decimal
    [&_ul]:pr-5 [&_ol]:pr-5
    [&_li]:text-right
    [&_li]:leading-[1.6]
  "
      >
        <h2 className="text-[18px] font-bold">תאור מוצר</h2>
        {description && (
          <div
            className="text-[#141414] text-right leading-relaxed space-y-2 w-full"
            dangerouslySetInnerHTML={{
              __html: DOMPurify.sanitize(description),
            }}
          />
        )}
      </div>

      {/* כאן מתחיל ה-Overview במעטפת עם מסגרת */}
      {overview && (
        <div
          className="flex flex-col gap-6 w-full bg-[#F9FAFB] p-6 border border-[#E5E7EB] rounded-[10px]   [direction:rtl] [unicode-bidi:plaintext]
    text-right
    [&_ul]:list-disc [&_ol]:list-decimal
    [&_ul]:list-inside [&_ol]:list-inside
    [&_ul]:pr-5 [&_ol]:pr-5
    [&_li]:text-right [&_li]:leading-[1.6]"
        >
          <div
            className="text-[#364153] text-right text-[16px] leading-[1.2] font-normal space-y-2"
            dangerouslySetInnerHTML={{
              __html: DOMPurify.sanitize(overview.text), // כאן יועבר התוכן אחרי סינון
            }}
          />
        </div>
      )}
      {/* תמונה אחת גדולה כרקע */}
      {(() => {
        const arr = Array.isArray(overview?.images) ? overview.images : [];
        const first = arr[0];
        const src =
          typeof first === "string"
            ? first
            : first?.url || first?.src || first?.image || null;

        if (!src) return null;

        return (
          <div
            className="w-full mx-auto rounded-[10px] border border-[#E5E7EB] bg-[#F9FAFB]"
            style={{
              maxWidth: "1324px",
              aspectRatio: "1324 / 615",
              backgroundImage: `url(${src})`,
              backgroundPosition: "50% 50%",
              backgroundSize: "cover",
              backgroundRepeat: "no-repeat",
            }}
            role="img"
            aria-label="תמונת מוצר"
          />
        );
      })()}
      {/*אחריות ותמיכה */}
      <div
        dir="rtl"
        className="flex flex-col items-start gap-4 w-full px-10 py-5"
      >
        <h3 className="text-[#101010] text-right text-[18px] leading-[1.2] font-normal tracking-[-0.198px]">
          אחריות ותמיכה
        </h3>
        {typeof warranty === "string" && (
          <p
            className="text-[#101010] text-right text-[16px] leading-[26px] font-normal"
            style={{ fontFamily: "Arial" }}
          >
            {warranty}
          </p>
        )}
      </div>
    </div>
  );
}

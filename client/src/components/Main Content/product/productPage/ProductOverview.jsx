import DOMPurify from "dompurify";

function getYoutubeEmbedUrl(raw) {
  if (!raw) return null;
  let url = raw.trim();

  // אם זה כבר embed – נחזיר כמו שהוא
  if (url.includes("/embed/")) return url;

  // watch?v=XXXXX
  if (url.includes("watch?v=")) {
    const id = url.split("watch?v=")[1]?.split("&")[0];
    if (id) return `https://www.youtube.com/embed/${id}`;
  }

  // youtu.be/XXXXX
  if (url.includes("youtu.be/")) {
    const id = url.split("youtu.be/")[1]?.split("?")[0];
    if (id) return `https://www.youtube.com/embed/${id}`;
  }

  return url;
}

export default function ProductOverview({ overview, description, warranty }) {
  const blocks = Array.isArray(overview?.blocks) ? overview.blocks : [];
  const hasBlocks = blocks.length > 0;

  // fallback לתמונה אחת ראשית אם אין blocks
  const heroImageSrc = (() => {
    if (!overview) return null;
    const arr = Array.isArray(overview.images) ? overview.images : [];
    const first = arr[0];
    if (!first) return null;
    if (typeof first === "string") return first;
    return first.url || first.src || first.image || null;
  })();

  return (
    <div className="flex flex-col items-start gap-6 w-full bg-white p-6 border border-[#EDEDED] rounded-lg">
      {/* תיאור מוצר */}
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
        <h2 className="text-[18px] font-bold">תיאור מוצר</h2>
        {description && (
          <div
            className="text-[#141414] text-right leading-relaxed space-y-2 w-full"
            dangerouslySetInnerHTML={{
              __html: DOMPurify.sanitize(description),
            }}
          />
        )}
      </div>

      {/* סקירה – לפי blocks אם קיימים, אחרת fallback ל-text הישן */}
      {overview && (
        <div
          className="
            flex flex-col gap-6 w-full bg-[#F9FAFB] p-6 border border-[#E5E7EB] rounded-[10px]
            [direction:rtl] [unicode-bidi:plaintext]
            text-right
            [&_ul]:list-disc [&_ol]:list-decimal
            [&_ul]:list-inside [&_ol]:list-inside
            [&_ul]:pr-5 [&_ol]:pr-5
            [&_li]:text-right [&_li]:leading-[1.6]
          "
        >
          {hasBlocks ? (
            <div className="flex flex-col gap-4 w-full">
              {blocks.map((block, index) => {
                if (!block || typeof block !== "object") return null;

                // בלוק טקסט
                if (block.type === "text") {
                  const html = block.html || "";
                  if (!html) return null;
                  return (
                    <div
                      key={`block-text-${index}`}
                      className="text-[#364153] text-right text-[16px] leading-[1.6] font-normal space-y-2"
                      dangerouslySetInnerHTML={{
                        __html: DOMPurify.sanitize(html),
                      }}
                    />
                  );
                }

                // בלוק תמונה
                if (block.type === "image") {
                  const src = block.url || block.src || block.image || null;
                  if (!src) return null;

                  return (
                    <div
                      key={`block-image-${index}`}
                      className="w-full rounded-[10px] border border-[#E5E7EB] bg-[#F9FAFB] overflow-hidden flex justify-center"
                    >
                      <img
                        src={src}
                        alt=""
                        className="max-w-full h-auto block"
                        loading="lazy"
                      />
                    </div>
                  );
                }

                // בלוק וידאו
                if (block.type === "video") {
                  const videoUrl = block.videoUrl || block.url;
                  if (!videoUrl) return null;

                  const isYouTube =
                    /youtube\.com|youtu\.be/.test(videoUrl) ||
                    block.provider === "youtube";
                  const embed = isYouTube ? getYoutubeEmbedUrl(videoUrl) : null;

                  return (
                    <div
                      key={`block-video-${index}`}
                      className="w-full rounded-[10px] border border-[#E5E7EB] bg-black/5 overflow-hidden"
                    >
                      {isYouTube && embed ? (
                        <div className="aspect-video w-full">
                          <iframe
                            src={embed}
                            title={`וידאו ${index + 1}`}
                            className="w-full h-full"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            referrerPolicy="no-referrer-when-downgrade"
                            allowFullScreen
                          />
                        </div>
                      ) : (
                        <video
                          className="w-full h-auto"
                          src={videoUrl}
                          controls
                        />
                      )}
                    </div>
                  );
                }

                return null;
              })}
            </div>
          ) : (
            // fallback – אם אין blocks, להשתמש ב־overview.text הישן
            <div
              className="text-[#364153] text-right text-[16px] leading-[1.2] font-normal space-y-2"
              dangerouslySetInnerHTML={{
                __html: DOMPurify.sanitize(overview.text || ""),
              }}
            />
          )}
        </div>
      )}

      {/* תמונת hero – רק אם אין blocks אבל כן יש תמונות ישנות */}
      {!hasBlocks && heroImageSrc && (
        <div
          className="w-full mx-auto rounded-[10px] border border-[#E5E7EB] bg-[#F9FAFB]"
          style={{
            maxWidth: "1324px",
            aspectRatio: "1324 / 615",
            backgroundImage: `url(${heroImageSrc})`,
            backgroundPosition: "50% 50%",
            backgroundSize: "cover",
            backgroundRepeat: "no-repeat",
          }}
          role="img"
          aria-label="תמונת מוצר"
        />
      )}

      {/* אחריות ותמיכה */}
      <div
        dir="rtl"
        className="flex flex-col items-start gap-4 w-full px-10 py-5"
      >
        <h3 className="text-[#101010] text-right text-[18px] leading-[1.2] font-normal tracking-[-0.198px]">
          אחריות ותמיכה
        </h3>
        {typeof warranty === "string" && (
          <p className="text-[#101010] text-right text-[16px] leading-[26px] font-normal">
            {warranty}
          </p>
        )}
      </div>
    </div>
  );
}

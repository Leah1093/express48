import { useEffect, useState } from "react";
import TopActions from "./TopActions";
import { useNavigate } from "react-router-dom";
import { AiFillStar } from "react-icons/ai";

export default function ProductDetails({
  product,
  existing,
  handleAddToCart,
  handleClick,
}) {
  const navigate = useNavigate();
  const [quantity, setQuantity] = useState(existing?.quantity || 1);
  useEffect(() => {
    if (existing?.quantity) {
      setQuantity(existing.quantity);
    }
  }, [existing?.quantity]);
  const [showFullDescription, setShowFullDescription] = useState(false);

  const handleChangeQuantity = (val) => {
    const num = Math.max(1, Number(val) || 1);
    setQuantity(num);
  };

  useEffect(() => {
  }, []);

  // מסיר תגיות HTML מהתיאור
  const cleanDescription = product.description
    ? product.description.replace(/<[^>]+>/g, "")
    : "";

  return (
    <div className="flex w-full max-w-[639px] flex-col items-end gap-[13.235px]">
      <div className="flex h-[105.882px] flex-col items-end gap-[7.941px] self-stretch">
        {/* כותרת */}
        <div className="flex flex-col items-end gap-2 w-full">
          <h1 className="w-full text-right font-normal text-[24px] leading-[1.2] tracking-[-0.264px] text-[#5C5C5C] break-words line-clamp-2">
            {product.title}
          </h1>

          <p className="text-right text-[12px] leading-[1.2] text-[#4A5565] font-normal truncate">
            {[
              product.model && `${product.model} :דגם`,
              product.sku && `${product.sku} :מק״ט`,
              product.brand && `${product.brand} :מותג`,
            ]
              .filter(Boolean)
              .join(" | ")}
          </p>
          <div className="flex items-center gap-2 justify-end text-right text-[12px] leading-[1.2]">
            {/* כמה דירוגים */}
            <button type="button" className="text-[#FF6500] hover:underline">
              {Number.isInteger(product?.ratings?.count)
                ? `${product.ratings.count} דירוגים`
                : ""}
            </button>

            {/* כוכבים */}
            <div
              className="flex"
              aria-label={`דירוג ${product?.ratings?.avg ?? 0} מתוך 5`}
            >
              {Array.from({ length: 5 }, (_, i) => {
                const filled = i < Math.round(product?.ratings?.avg ?? 0);
                return (
                  <svg
                    key={i}
                    xmlns="http://www.w3.org/2000/svg"
                    width="11"
                    height="11"
                    viewBox="0 0 11 11"
                    className={filled ? "text-[#FFA366]" : "text-[#E5E7EB]"}
                    aria-hidden
                  >
                    <g clipPath="url(#clip0_16_5172)">
                      <path
                        d="M5.0852 1.01264C5.10454 0.973577 5.1344 0.940696 5.17143 0.917708C5.20846 0.894719 5.25118 0.882538 5.29476 0.882538C5.33835 0.882538 5.38106 0.894719 5.41809 0.917708C5.45512 0.940696 5.48499 0.973577 5.50432 1.01264L6.52344 3.0769C6.59057 3.21277 6.68968 3.33032 6.81224 3.41946C6.93481 3.50859 7.07717 3.56666 7.22711 3.58867L9.50623 3.9222C9.54942 3.92845 9.58999 3.94667 9.62336 3.97478C9.65673 4.0029 9.68157 4.03979 9.69506 4.08129C9.70856 4.12278 9.71017 4.16723 9.69973 4.2096C9.68928 4.25196 9.66718 4.29056 9.63594 4.32102L7.9877 5.92602C7.879 6.03195 7.79767 6.1627 7.75072 6.30703C7.70376 6.45136 7.69258 6.60494 7.71814 6.75455L8.10726 9.0222C8.11488 9.06536 8.11022 9.1098 8.0938 9.15044C8.07739 9.19108 8.04988 9.22629 8.01441 9.25205C7.97895 9.27781 7.93696 9.29308 7.89323 9.29612C7.8495 9.29916 7.8058 9.28986 7.76711 9.26926L5.72976 8.19808C5.59552 8.12759 5.44616 8.09076 5.29454 8.09076C5.14292 8.09076 4.99356 8.12759 4.85932 8.19808L2.82241 9.26926C2.78373 9.28973 2.74008 9.29894 2.69643 9.29584C2.65278 9.29274 2.61087 9.27744 2.57548 9.25171C2.54009 9.22596 2.51263 9.19081 2.49623 9.15024C2.47983 9.10966 2.47514 9.0653 2.4827 9.0222L2.87138 6.75499C2.89705 6.60531 2.88593 6.45164 2.83897 6.30722C2.79201 6.1628 2.71062 6.03197 2.60182 5.92602L0.953584 4.32146C0.922082 4.29103 0.899758 4.25237 0.889156 4.20988C0.878554 4.16738 0.880101 4.12276 0.893619 4.0811C0.907138 4.03945 0.932085 4.00242 0.965618 3.97425C0.999152 3.94608 1.03992 3.92789 1.08329 3.92176L3.36197 3.58867C3.51208 3.56683 3.65464 3.50884 3.77737 3.41969C3.9001 3.33054 3.99934 3.2129 4.06653 3.0769L5.0852 1.01264Z"
                        fill="currentColor"
                        stroke="currentColor"
                        strokeWidth="0.882353"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </g>
                    <defs>
                      <clipPath id="clip0_16_5172">
                        <rect width="10.5882" height="10.5882" fill="white" />
                      </clipPath>
                    </defs>
                  </svg>
                );
              })}
            </div>

            <span className="text-[#000]">
              <span dir="ltr">5</span>

              <span> מתוך </span>
              <span dir="ltr">
                {Number.isFinite(product?.ratings?.avg)
                  ? product.ratings.avg.toFixed(1)
                  : ""}
              </span>
            </span>
          </div>
        </div>
        <div className="h-[0.662px] self-stretch bg-[#EDEDED]" aria-hidden />
        <div className="flex flex-col items-end gap-[7.941px] p-[11.25px] self-stretch rounded-[6.618px] border-[0.662px] border-[#EDEDED] bg-white">
          {/* תוכן התיבה */}
          {(() => {
            const inStock = product?.inStock || (product?.stock ?? 0) > 0;
            return (
              <div className="flex flex-row-reverse items-center gap-[6px] self-stretch">
                <span
                  className={`w-[5.294px] h-[5.294px] rounded-full ${
                    inStock ? "bg-[#00C950]" : "bg-[#E5E7EB]"
                  }`}
                  aria-hidden
                />
                <p
                  className={`text-[12px] leading-[1.2] text-right ${
                    inStock ? "text-[#008236]" : "text-[#4A5565]"
                  }`}
                >
                  {inStock ? "במלאי" : "לא במלאי"}
                </p>
              </div>
            );
          })()}
          {typeof product?.stock === "number" && product.stock > 0 && (
            <p className="text-[12px] leading-[1.2] text-right text-[#FF6500]">
              <span dir="ltr">נותרו עוד {product.stock} יחידות במלאי</span>
            </p>
          )}
          <div className="h-[0.662px] self-stretch bg-black/10" aria-hidden />

          {/* <p className="text-[12px] leading-[1.2] text-[#4A5565]">שורה 2</p>
          <p className="text-[12px] leading-[1.2] text-[#4A5565]">שורה 3</p> */}
        </div>
        <div className="flex flex-col items-end gap-2">
          <span className="font-rubik text-[14px] leading-[1.2] text-right text-black">
            כמות
          </span>

          <div className="flex w-[106px] h-[38px] px-[4px] justify-center items-center gap-[4px] rounded-[10px] border border-[#B7B7B7] bg-white">
            {/* פלוס */}
            <button
              onClick={() =>
                handleChangeQuantity(Math.max(1, Number(quantity) + 1))
              }
              className="w-[28px] h-[28px] flex items-center justify-center rounded-[4px] text-[#101010] opacity-40 hover:opacity-100 transition"
              aria-label="הוסף"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                fill="none"
                viewBox="0 0 16 16"
              >
                <path
                  d="M8 3.73334V12.2667M12.2667 8H3.73334"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>

            {/* מספר */}
            <div className="w-[28px] h-[28px] flex items-center justify-center">
              <span className="text-[14px] leading-[1.2] text-[#101010]">
                {Number(quantity) || 1}
              </span>
            </div>

            {/* מינוס */}
            <button
              onClick={() =>
                handleChangeQuantity(Math.max(1, Number(quantity) - 1))
              }
              className="w-[28px] h-[28px] flex items-center justify-center rounded-[4px] text-[#101010] opacity-40 hover:opacity-100 transition disabled:opacity-30 disabled:cursor-not-allowed"
              aria-label="הפחת"
              disabled={Number(quantity) <= 1}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                fill="none"
                viewBox="0 0 16 16"
              >
                <path
                  d="M3.73334 8H12.2667"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>
        </div>
        {(() => {
  const d = product?.discount;
  const now = new Date();
  const hasTypeVal =
    (d?.discountType === "percent" || d?.discountType === "fixed") &&
    typeof d?.discountValue === "number" &&
    d.discountValue > 0;
  const startsOk = !d?.startsAt || new Date(d.startsAt) <= now;
  const endsOk = !d?.expiresAt || new Date(d.expiresAt) >= now;
  const discountActive = hasTypeVal && startsOk && endsOk;

  return discountActive ? (
    <div className="flex flex-col items-end gap-[10px] p-[11px] self-stretch rounded-[6.618px] border-[0.662px] border-[#FFF7F2] bg-[#FFF7F2]">
      <div className="flex w-full flex-col items-end gap-[12px]">
        {(() => {
          const d = product?.discount;
          const now = Date.now();
          const active =
            d &&
            (d.discountType === "percent" ||
              d.discountType === "fixed") &&
            typeof d.discountValue === "number" &&
            d.discountValue > 0 &&
            (!d.startsAt || new Date(d.startsAt).getTime() <= now) &&
            (!d.expiresAt || new Date(d.expiresAt).getTime() >= now);

          if (!active) return null;

          const left = d.expiresAt
            ? new Date(d.expiresAt).getTime() - now
            : 0;
          const txt =
            left > 0
              ? (() => {
                  const dd = Math.floor(left / 86400000),
                    hh = Math.floor((left % 86400000) / 3600000),
                    mm = Math.floor((left % 3600000) / 60000);
                  return (
                    <>
                      <span dir="ltr">
                        {" "}
                        מסתיים בעוד {dd} ימים {hh} שעות ו {mm} דקות
                      </span>
                    </>
                  );
                })()
              : "הסתיים";

          return (
            <div className="flex items-center justify-end gap-2 self-stretch">
              <span className="text-[12px] leading-[1.2] text-[#4A5565]">
                {txt}
              </span>
              <span className="inline-flex h-[14.559px] px-[5.294px] py-[1.324px] items-center justify-center rounded-[5.294px] bg-[#E7000B] text-white text-[12px] leading-[1.2]">
                מבצע לזמן מוגבל
              </span>
            </div>
          );
        })()}
      </div>
      {(() => {
        const base = product?.price?.amount ?? 0;
        const d = product?.discount;
        const now = Date.now();

        const active =
          d &&
          (d.discountType === "percent" ||
            d.discountType === "fixed") &&
          typeof d.discountValue === "number" &&
          d.discountValue > 0 &&
          (!d.startsAt || new Date(d.startsAt).getTime() <= now) &&
          (!d.expiresAt || new Date(d.expiresAt).getTime() >= now);

        const final = !active
          ? base
          : d.discountType === "percent"
          ? Math.max(0, base - (base * d.discountValue) / 100)
          : Math.max(0, base - d.discountValue);

        const showPercent =
          active && d.discountType === "percent" && base > 0;
        const percentOff = showPercent
          ? Math.round(d.discountValue)
          : 0;

        return (
          <div className="flex items-center justify-end gap-2">
            {/* מחיר מקורי */}
            {active && final < base && (
              <span
                className="text-[12px] leading-[1.2] text-[#101010] line-through"
                dir="ltr"
              >
                ₪{base.toLocaleString("he-IL")}
              </span>
            )}
            {/* מחיר לאחר הנחה (או רגיל אם אין מבצע) */}
            {(() => {
              const base = product?.price?.amount;
              return (
                <div className="flex items-center justify-end gap-2 mt-2">
                  <span
                    className="text-[16px] leading-[1.2] text-[#101010]"
                    dir="ltr"
                  >
                    ₪{base.toLocaleString("he-IL")}
                  </span>
                </div>
              );
            })()}
            {/* אחוז הנחה – רק כשסוג ההנחה percent */}
            {showPercent && (
              <span className="text-[12px] leading-[1.2] text-[#E7000B]">
                {percentOff}%-{" "}
              </span>
            )}
          </div>
        );
      })()}
    </div>
  ) : (
    <div className="flex items-center justify-end gap-2 mt-2">
      {/* מחיר רגיל */}
      <span className="text-[16px] leading-[1.2] text-[#101010]" dir="ltr">
        ₪{product?.price?.amount.toLocaleString("he-IL")}
      </span>
    </div>
  );
})()}

        {/* כפתורים */}
        <div className="flex w-full flex-col items-end gap-3.5">
          <button
            onClick={() => {
              if (existing) {
                navigate("/cart");
              } else {
                handleAddToCart(quantity);
              }
            }}
            className="flex w-[617px] max-w-full min-h-[32px] px-[124px] py-[15px] items-center justify-center gap-[4px] rounded-[8px] bg-[#FF6500] text-[#101010] text-[14px] font-normal leading-[1.2] hover:opacity-90 active:opacity-80 transition"
          >
            {existing ? "עדכון כמות" : "הוסף לעגלה "}
          </button>

          <button
            onClick={handleClick}
            className="flex w-[617px] max-w-full min-h-[32px] px-[124px] py-[15px] items-center justify-center gap-[4px] rounded-[8px] bg-[#FFA366] text-[#101010] text-[14px] font-normal leading-[1.2] hover:opacity-90 active:opacity-80 transition"
          >
            קנה עכשיו
          </button>
          <button
            // onClick={handleAddToCompare} // החליפי לפונקציה שלך אם שונה
            className="flex w-[617px] max-w-full min-h-[32px] px-[124px] py-[15px] items-center justify-center gap-[4px] rounded-[8px] border border-[#EDEDED] text-[#101010] text-[14px] leading-[1.2] font-normal transition hover:bg-[#F9FAFB] active:bg-[#F3F4F6]"
          >
            הוסף להשוואת מחירים
          </button>
        </div>
        <div className="h-[0.662px] w-full bg-black/10 self-stretch" />

        {/* צבע
        {product.variations?.length > 0 && (
          <div className="flex flex-col gap-4 items-end w-full">
            <span className="text-sm">
              <b> צבע:</b>{" "}
              {selectedVariation?.attributes?.color ||
                product.variations[0]?.attributes?.color}
            </span>
            <div className="flex justify-end gap-2 flex-wrap w-full">
              {product.variations.map((v, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedVariation(v)}
                  className={`px-[12px] py-[4px] rounded-2xl border text-[14px] transition-colors
                ${
                  selectedVariation === v
                    ? "bg-[#fff7f2] border-[#ff6500] text-orange-600"
                    : "border-[#141414]/20 text-[#141414] hover:bg-gray-50"
                }`}
                >
                  {v.attributes.color}
                </button>
              ))}
            </div>
          </div>
        )} */}

        {/* תיאור עם "קרא עוד"
        <div className="w-full">
          <p
            className={`text-[16px] text-[#141414] leading-[160%] whitespace-pre-line transition-all duration-300 ${
              showFullDescription
                ? "max-h-none"
                : "max-h-[120px] overflow-hidden"
            }`}
          >
            {cleanDescription}
          </p>
          {cleanDescription.length > 200 && (
            <button
              onClick={() => setShowFullDescription(!showFullDescription)}
              className="mt-2 text-sm hover:underline"
            >
              {showFullDescription ? "הצג פחות" : "לתיאור המלא"}
            </button>
          )}
        </div> */}
      </div>
    </div>
  );
}

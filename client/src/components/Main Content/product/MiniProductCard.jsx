import { useState } from "react";
import { useNavigate } from "react-router-dom";

// סימון מטבע
const symbolFor = (currency) => {
  switch (currency) {
    case "ILS": return "₪";
    case "USD": return "$";
    case "EUR": return "€";
    default: return currency || "";
  }
};

export default function MiniProductCard({ product, onAddToCart }) {
  const [imgIndex, setImgIndex] = useState(0);
  const symbol = symbolFor(product?.currency);
    const navigate = useNavigate();


  // מעבר בין תמונות לפי מיקום העכבר (רק בדסקטופ)
  const handleMouseMove = (e) => {
    const imgs = product?.images || [];
    if (imgs.length < 2) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percent = Math.max(0, Math.min(1, x / rect.width));
    const next = Math.min(imgs.length - 1, Math.floor(percent * imgs.length));
    if (next !== imgIndex) setImgIndex(next);
  };
  const handleMouseLeave = () => setImgIndex(0);

  const hasDiscount =
    !!product?.hasDiscount && product?.basePrice > product?.finalPrice;

  return (
    <div
      dir="rtl"
      className="
    relative flex flex-col items-center
    w-full min-w-[160px] flex-grow
    rounded-[12px] border border-[#EDEDED] overflow-hidden
    pt-[1px] gap-[16px]
  "
      onClick={() => navigate(`/products/${product.storeId?.slug}/${product.slug}`)}
    >
      {/* תמונה */}
      <div
        className="
      relative w-full h-[170px] md:h-[200px]
      flex justify-center items-center
      px-[20px] md:px-[88px] pt-[8px]
      rounded-t-[10px] overflow-hidden bg-white
    "
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        {(product?.images || []).map((src, i) => (
          <img
            key={i}
            src={src}
            alt={product?.title || ""}
            className={`absolute inset-0 w-full h-full object-contain transition-opacity duration-300 ${i === imgIndex ? "opacity-100" : "opacity-0"
              }`}
            draggable={false}
          />
        ))}
      </div>

      {/* כפתור עגלה */}
      <button
        type="button"
        aria-label="הוסף לסל"
        onClick={() => onAddToCart?.(product)}
        className="
      absolute left-[20px] bottom-[115px]
      flex justify-center items-center
      w-10 h-10 rounded-[20px] bg-[#FFF7F2] p-2
      
    "
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none">
          <path
            d="M15.75 10.5V6c0-.994-.395-1.948-1.098-2.651A3.747 3.747 0 0 0 12 2.25c-.994 0-1.948.395-2.651 1.099A3.747 3.747 0 0 0 8.25 6v4.5M19.606 8.507l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.13 1.13 0 0 1-1.12-1.372l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007Z"
            stroke="#FF6500"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {/* כותרת */}
      <div
        className="
          flex justify-center items-center
          h-[44px] w-full px-2 text-center
          text-[#141414] font-rubik
          text-[14px] font-normal leading-[120%] tracking-[-0.154px]
          line-clamp-3
        "
      >
        {product?.title}
      </div>

      {/* מחיר */}
      <div
        className={`
          flex justify-center items-center gap-[8px] self-stretch
          py-4
          ${hasDiscount ? "bg-[#FFF7F2]" : "bg-white"}
        `}
      >
        <div className="text-[#000] font-rubik text-[14px] font-semibold leading-[120%] tracking-[-0.154px]">
          {product?.finalPrice ?? product?.basePrice} {symbol}
        </div>

        {hasDiscount && (
          <div className="text-[#000] font-rubik text-[11px] font-normal leading-[100%] tracking-[-0.11px] line-through">
            {product?.basePrice} {symbol}
          </div>
        )}
      </div>
    </div>
  );
}

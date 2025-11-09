import { useEffect, useState } from "react";
import TopActions from "./TopActions";
import { useNavigate } from "react-router-dom";



export default function ProductDetails({
  product,
  existing,
  selectedVariation,
  setSelectedVariation,
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
    console.log("Product details:", product);
  }, []);

  // מסיר תגיות HTML מהתיאור
  const cleanDescription = product.description
    ? product.description.replace(/<[^>]+>/g, "")
    : "";

  return (<div className="w-full">
    {/* אייקונים עליונים */}
    <div className="flex justify-start ">
      <TopActions product={product} />
    </div>
    <div className="flex flex-col items-end w-full gap-6 font-rubik text-right h-full">

      {/* כותרת */}
      <div className="flex flex-col items-end gap-2 w-[70%]">
        <h1 className="w-full font-semibold text-[#141414] text-2xl leading-[120%] tracking-[-0.011em]">
          {product.title}
        </h1>
        {/* <p className="text-gray-500 text-sm">{product.brand}</p> */}
      </div>

      {/* תיאור עם "קרא עוד" */}
      <div className="w-full">
        <p
          className={`text-[16px] text-[#141414] leading-[160%] whitespace-pre-line transition-all duration-300 ${showFullDescription ? "max-h-none" : "max-h-[120px] overflow-hidden"}`}
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
      </div>

      {/* מחיר */}
      <div className="flex flex-col gap-2 items-end w-full">
        <span className="text-[16px]"><b>מחיר</b></span>
        <div className="flex items-center gap-2">

          {product.discount && (
            <span className="text-sm text-green-600 bg-green-100 px-2 py-1 rounded">
              {product.discount.discountType === "percent"
                ? `-${product.discount.discountValue}%`
                : `-${product.discount.discountValue}₪`}
            </span>
          )}
          <span className="text-[24px] font-semibold">
            ₪{product.price?.amount || product.price}
          </span>
        </div>
      </div>


      {/* צבע */}
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
                ${selectedVariation === v
                    ? "bg-[#fff7f2] border-[#ff6500] text-orange-600"
                    : "border-[#141414]/20 text-[#141414] hover:bg-gray-50"
                  }`}
              >
                {v.attributes.color}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* כמות */}
      <div className="flex items-center justify-end gap-4 w-full">
        <div className="flex items-center gap-2">
          {/* כפתור הפחתה */}
          <button
            onClick={() => handleChangeQuantity(quantity - 1)}
            className="w-6 h-6 flex items-center justify-center rounded hover:bg-[#fff7f2] active:bg-[#fff0e6] transition"
            title="הפחת"
          >
            −
          </button>

          {/* אינפוט */}
          <input
            type="number"
            min="1"
            value={quantity}
            onChange={(e) => handleChangeQuantity(e.target.value)}
            className="w-8 text-center border-none bg-transparent text-sm text-[#141414] focus:outline-none
                     appearance-none [appearance:textfield] 
                     [&::-webkit-inner-spin-button]:appearance-none 
                     [&::-webkit-outer-spin-button]:appearance-none"
          />

          {/* כפתור הוספה */}
          <button
            onClick={() => handleChangeQuantity(quantity + 1)}
            className="w-6 h-6 flex items-center justify-center rounded hover:bg-[#fff7f2] active:bg-[#fff0e6] transition"
            title="הוסף"
          >
            +
          </button>
        </div>        <span className="text-sm"><b>כמות</b></span>
      </div>

      {/* כפתורים */}
      <div className="flex flex-col gap-4 w-full">
        <button
          onClick={() => {
            if (existing) {
              // אם קיים בעגלה → לעדכן ולעבור לדף העגלה
              navigate("/cart");
            } else {
              // אם לא קיים בעגלה → להוסיף כרגיל
              handleAddToCart(quantity);
            }
          }}
          className="w-full h-[54px] rounded-2xl bg-[#141414] text-white text-[16px] font-bold hover:bg-black transition"
        >
          {existing ? "עדכון כמות" : "הוסף לעגלת קניות"}
        </button>
        <button
          onClick={handleClick}
          className="w-full h-[54px] rounded-2xl border-2 border-[#ff6500] text-orange-600 text-[16px] font-bold hover:bg-[#fff7f2] transition"
        >
          קנה עכשיו
        </button>
      </div>
    </div>
  </div>
  );
}

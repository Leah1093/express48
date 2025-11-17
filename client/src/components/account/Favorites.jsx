import { useGetFavoritesQuery } from "../../redux/services/favoritesApi";

// אייקון שלוש נקודות
function MoreDotsIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
    >
      <path
        d="M6.5 12C6.5 11.8011 6.42098 11.6103 6.28033 11.4697C6.13968 11.329 5.94891 11.25 5.75 11.25C5.55109 11.25 5.36032 11.329 5.21967 11.4697C5.07902 11.6103 5 11.8011 5 12C5 12.1989 5.07902 12.3897 5.21967 12.5303C5.36032 12.671 5.55109 12.75 5.75 12.75C5.94891 12.75 6.13968 12.671 6.28033 12.5303C6.42098 12.3897 6.5 12.1989 6.5 12ZM12.5 12C12.5 11.8011 12.421 11.6103 12.2803 11.4697C12.1397 11.329 11.9489 11.25 11.75 11.25C11.5511 11.25 11.3603 11.329 11.2197 11.4697C11.079 11.6103 11 11.8011 11 12C11 12.1989 11.079 12.3897 11.2197 12.5303C11.3603 12.671 11.5511 12.75 11.75 12.75C11.9489 12.75 12.1397 12.671 12.2803 12.5303C12.421 12.3897 12.5 12.1989 12.5 12ZM18.5 12C18.5 11.8011 18.421 11.6103 18.2803 11.4697C18.1397 11.329 17.9489 11.25 17.75 11.25C17.5511 11.25 17.3603 11.329 17.2197 11.4697C17.079 11.6103 17 11.8011 17 12C17 12.1989 17.079 12.3897 17.2197 12.5303C17.3603 12.671 17.5511 12.75 17.75 12.75C17.9489 12.75 18.1397 12.671 18.2803 12.5303C18.421 12.3897 18.5 12.1989 18.5 12Z"
        stroke="#7A7575"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// תמונה ראשונה של המוצר
function getProductImage(product) {
  if (!product) return null;
  if (Array.isArray(product.images) && product.images.length > 0) {
    return product.images[0];
  }
  return null;
}

// price.amount בסיסי, discount.discountValue = גובה ההנחה בש"ח
function getPrices(product) {
  const base = product?.price?.amount;
  if (typeof base !== "number") {
    return { price: null, originalPrice: null };
  }

  const discountValue = product?.discount?.discountValue;

  if (typeof discountValue !== "number" || discountValue <= 0) {
    return { price: base, originalPrice: null };
  }

  const discounted = Math.max(base - discountValue, 0);
  return { price: discounted, originalPrice: base };
}

export default function Favorites() {
  const { data, isLoading, isError, error } = useGetFavoritesQuery();

  const favorites = Array.isArray(data)
    ? data
    : Array.isArray(data?.items)
    ? data.items
    : [];

  const errorMessage =
    error?.data?.error || error?.data?.message || "אירעה שגיאה בטעינת המועדפים";

  return (
    <div dir="rtl" className="w-full">
      {/* כותרת למעלה */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-right">המועדפים שלי</h1>

        {/* לינק רק בדסקטופ */}
        <button
          type="button"
          className="hidden md:inline-flex text-xs text-[#FF6500] hover:underline"
        >
          לכל המועדפים שלי
        </button>
      </div>

      {isLoading && (
        <p className="text-right text-gray-600">טוען את המועדפים שלך...</p>
      )}

      {!isLoading && isError && (
        <p className="text-right text-red-600">{errorMessage}</p>
      )}

      {!isLoading && !isError && favorites.length === 0 && (
        <p className="text-right text-gray-600">אין לך מוצרים במועדפים כרגע.</p>
      )}

      {!isLoading && !isError && favorites.length > 0 && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
            {favorites.map((fav) => {
              const product = fav.productId || {};
              const img = getProductImage(product);
              const { price, originalPrice } = getPrices(product);

              return (
                <article
                  key={fav._id || product._id || product.sku}
                  className="
                    flex flex-col
                    rounded-2xl border border-[#F0F0F0] bg-white
                    shadow-[0_2px_6px_rgba(0,0,0,0.04)]
                    hover:shadow-[0_4px_10px_rgba(0,0,0,0.06)]
                    transition-shadow
                    overflow-hidden
                  "
                >
                  {/* חלק עליון – תמונה פרוסה על כל הרוחב */}
                  <div className="flex-1 flex flex-col">
                    <div className="mt-2 w-full">
                      <div
                        className="
                          w-full
                          h-[181px]
                          bg-[#F5F5F5]
                          flex items-center justify-center
                        "
                      >
                        {img ? (
                          <img
                            src={img}
                            alt={product.title || product.metaTitle || "מוצר"}
                            className="w-full h-full object-contain"
                          />
                        ) : (
                          <span className="text-[11px] text-gray-400">
                            אין תמונה
                          </span>
                        )}
                      </div>
                    </div>

                    {/* שם המוצר */}
                    <div className="px-3 pt-3 pb-4 flex-1 flex flex-col">
                      <h2 className="text-[13px] font-medium leading-snug text-[#141414] line-clamp-3 text-right">
                        {product.title || product.metaTitle || "מוצר ללא שם"}
                      </h2>
                    </div>
                  </div>

                  {/* פס מחיר תחתון */}
                  <div
                    className="
                      flex items-center justify-between gap-2
                      w-full
                      bg-[#FFF7F2]
                      py-4 px-4
                    "
                  >
                    {/* מחיר רגיל + מחיר מבצע בשורה אחת */}
                    <div className="flex-1 flex items-center justify-center gap-2 ">
                      <span
                        className="
                          text-[14px] font-semibold leading-[1.2]
                          tracking-[-0.154px]
                          text-[#141414]
                          text-center
                        "
                      >
                        {price != null ? `${price} ₪` : "-"}
                      </span>
                      {originalPrice != null && originalPrice !== price && (
                        <span
                          className="
                            text-[10px] font-normal leading-[1]
                            tracking-[-0.11px]
                            text-[#141414]
                            line-through
                            text-center
                          "
                        >
                          {originalPrice} ₪
                        </span>
                      )}
                    </div>

                    <button
                      type="button"
                      className="w-6 h-6 flex items-center justify-center flex-shrink-0"
                    >
                      <MoreDotsIcon />
                    </button>
                  </div>
                </article>
              );
            })}
          </div>

          {/* כפתור מובייל אחרי כל המועדפים */}
          <div className="mt-4 md:hidden flex justify-center">
            <button
              type="button"
              className="
                flex h-[42px]
                px-9
                justify-center items-center gap-2
                rounded-[12px]
                border border-[#FF6500]
                bg-[#FFF7F2]
                text-[14px] font-medium
                text-[#666666]
              "
            >
              הצג עוד
            </button>
          </div>
        </>
      )}
    </div>
  );
}

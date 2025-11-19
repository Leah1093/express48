import { useState } from "react";
import { useGetOrdersQuery } from "../../redux/services/orderApi";

// ========= עזר לפורמט =========
function formatStatusLabel(status) {
  switch (status) {
    case "pending":
      return "ממתין";
    case "paid":
      return "שולם";
    case "shipped":
      return "נשלח";
    case "delivered":
      return "נמסר";
    case "cancelled":
      return "בוטל";
    default:
      return status || "";
  }
}

// צבעים שונים לכל סטטוס
function getStatusColors(status) {
  switch (status) {
    case "pending":
      return {
        bg: "bg-[#FFF3E0]", // כתום בהיר
        text: "text-[#FF9800]",
      };
    case "paid":
    case "delivered":
    case "shipped":
      return {
        bg: "bg-[#E5F8EA]", // ירוק בהיר
        text: "text-[#0BC33F]",
      };
    case "cancelled":
      return {
        bg: "bg-[#FFE5E5]", // אדום בהיר
        text: "text-[#F44336]",
      };
    default:
      return {
        bg: "bg-[#F0F0F0]",
        text: "text-[#141414]",
      };
  }
}

// ========= אייקוני SVG =========

function ArrowRightSmall() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="18"
      height="18"
      viewBox="0 0 18 18"
      fill="none"
    >
      <path
        d="M5.75 3.23438L11.1406 8.625L5.75 14.0156"
        stroke="#141414"
        strokeWidth="1.07812"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M5.75 3.23438L11.1406 8.625L5.75 14.0156"
        stroke="black"
        strokeOpacity="0.2"
        strokeWidth="1.07812"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ArrowLeftSmall() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="18"
      height="18"
      viewBox="0 0 18 18"
      fill="none"
    >
      <path
        d="M11.3203 14.0156L5.92969 8.625L11.3203 3.23438"
        stroke="#141414"
        strokeWidth="1.07812"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M11.3203 14.0156L5.92969 8.625L11.3203 3.23438"
        stroke="black"
        strokeOpacity="0.2"
        strokeWidth="1.07812"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ExternalIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="14"
      height="14"
      viewBox="0 0 14 14"
      fill="none"
    >
      <path
        d="M5.75 2.75H11.25C11.6478 2.75 12.0294 2.90804 12.3107 3.18934C12.592 3.47064 12.75 3.85218 12.75 4.25V11.25C12.75 11.6478 12.592 12.0294 12.3107 12.3107C12.0294 12.592 11.6478 12.75 11.25 12.75H4.25C3.85218 12.75 3.47064 12.592 3.18934 12.3107C2.90804 12.0294 2.75 11.6478 2.75 11.25V5.75M9.75 9.75L0.75 0.75M0.75 0.75H4.25M0.75 0.75V4.25"
        stroke="#101010"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function Orders() {
  const { data: orders = [], isLoading, isError, error } = useGetOrdersQuery();

  const [imageIndexByOrder, setImageIndexByOrder] = useState({});

  const errorMessage =
    error?.data?.error || error?.data?.message || "אירעה שגיאה בטעינת ההזמנות";

  // עוזר להוציא מערך תמונות לכל הזמנה
  const getOrderImages = (order) => {
    if (!order?.items) return [];

    const urls = order.items.flatMap((item) => {
      const product = item.productId || {};

      if (Array.isArray(product.images) && product.images.length > 0) {
        return product.images;
      }

      if (product.image) return [product.image];
      if (product.imageUrl) return [product.imageUrl];

      return [];
    });

    // להסיר כפילויות + ריק
    return Array.from(new Set(urls.filter(Boolean)));
  };

  const handleNextImage = (orderId, imagesCount) => {
    setImageIndexByOrder((prev) => {
      const current = prev[orderId] || 0;
      const next = (current + 1) % imagesCount;
      return { ...prev, [orderId]: next };
    });
  };

  const handlePrevImage = (orderId, imagesCount) => {
    setImageIndexByOrder((prev) => {
      const current = prev[orderId] || 0;
      const next = (current - 1 + imagesCount) % imagesCount;
      return { ...prev, [orderId]: next };
    });
  };

  return (
    <div dir="rtl" className="w-full">
      {/* כותרת + לינק קטן למעלה (רק בדסקטופ) */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-right">ההזמנות שלי</h1>
        <button
          type="button"
          className="hidden md:inline-flex text-xs text-[#FF6500] hover:underline"
        >
          לכל ההזמנות שלי
        </button>
      </div>

      {isLoading && (
        <p className="text-right text-gray-600">טוען את ההזמנות שלך...</p>
      )}

      {!isLoading && isError && (
        <p className="text-right text-red-600">{errorMessage}</p>
      )}

      {!isLoading && !isError && orders.length === 0 && (
        <p className="text-right text-gray-600">אין לך הזמנות עדיין.</p>
      )}

      {!isLoading && !isError && orders.length > 0 && (
        <>
          <div className="space-y-3">
            {orders.map((order) => {
              const total =
                order.discountedAmount != null
                  ? order.discountedAmount
                  : order.totalAmount;

              const itemsCount = Array.isArray(order.items)
                ? order.items.reduce(
                    (sum, item) => sum + (item.quantity || 0),
                    0
                  )
                : 0;

              const images = getOrderImages(order);
              const orderKey = order._id || order.orderId || "";
              const currentIndex =
                imageIndexByOrder[orderKey] && images.length > 0
                  ? imageIndexByOrder[orderKey] % images.length
                  : 0;
              const currentImage =
                images.length > 0 ? images[currentIndex] : null;

              const statusLabel = formatStatusLabel(order.status);
              const statusColors = getStatusColors(order.status);

              return (
                <div
                  key={orderKey}
                  className="
                    flex flex-wrap items-center justify-between
                    gap-3
                    rounded-xl border border-[#F0F0F0] bg-white
                    px-4 py-3 hover:shadow-sm transition-shadow
                  "
                >
                  {/* בלוק: תמונה + חצים */}
                  <div className="flex items-center gap-3">
                    {images.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handlePrevImage(orderKey, images.length)}
                        className="w-[17.25px] h-[17.25px] flex items-center justify-center"
                      >
                        <ArrowLeftSmall />
                      </button>
                    )}

                    <div className="w-16 h-16 rounded-lg bg-[#F5F5F5] flex items-center justify-center overflow-hidden">
                      {currentImage ? (
                        <img
                          src={currentImage}
                          alt={order.items?.[0]?.productId?.title || "מוצר"}
                          className="w-full h-full object-contain"
                        />
                      ) : (
                        <span className="text-[10px] text-gray-400">
                          אין תמונה
                        </span>
                      )}
                    </div>

                    {images.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleNextImage(orderKey, images.length)}
                        className="w-[17.25px] h-[17.25px] flex items-center justify-center"
                      >
                        <ArrowRightSmall />
                      </button>
                    )}
                  </div>

                  {/* בלוק: 3 עמודות – מספר פריטים / סכום / סטטוס */}
                  <div className="flex items-center justify-center gap-6 flex-1 flex-wrap">
                    {/* מספר פריטים */}
                    <div className="text-right min-w-[70px]">
                      <div className="text-[11px] text-gray-500 mb-0.5">
                        מספר פריטים
                      </div>
                      <div className="text-[12px] font-normal text-[#141414]">
                        {itemsCount} פריטים
                      </div>
                    </div>

                    {/* סכום כולל */}
                    <div className="text-right min-w-[70px]">
                      <div className="text-[11px] text-gray-500 mb-0.5">
                        סכום כולל
                      </div>
                      <div className="text-[13px] font-semibold text-[#141414]">
                        {total} ₪
                      </div>
                    </div>

                    {/* סטטוס הזמנה */}
                    <div className="flex justify-center min-w-[80px]">
                      <div
                        className={`
                          inline-flex px-2 py-1
                          rounded-full
                          items-center justify-center
                          ${statusColors.bg}
                        `}
                      >
                        <span
                          className={`
                            text-[10px]
                            font-medium
                            leading-[10px]
                            ${statusColors.text}
                          `}
                        >
                          {statusLabel}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* בלוק: אייקון חיצוני (ימין/שמאל לפי RTL) */}
                  <div className="flex items-center justify-center w-6 h-6 flex-shrink-0">
                    <ExternalIcon />
                  </div>
                </div>
              );
            })}
          </div>

          {/* כפתור מובייל אחרי כל ההזמנות */}
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
              כל ההזמנות
            </button>
          </div>
        </>
      )}
    </div>
  );
}

import React from "react";

/**
 * קומפוננט לתצוגת מוצר בדף תשלום
 * גדול יותר ונוח יותר לקריאה מאשר CartRow הרגיל
 */
export default function PaymentProductRow({ item }) {
  const getUnitPrice = (it) =>
    Number(it?.unitPrice ?? it?.productId?.price ?? it?.product?.price ?? it?.price ?? 0);
  const getQty = (it) => Number(it?.quantity ?? 0);

  const unitPrice = getUnitPrice(item);
  const quantity = getQty(item);
  const totalPrice = unitPrice * quantity;

  const title = item?.productId?.title || item?.product?.title || item?.title || "מוצר";
  const image = item?.snapshot?.images?.[0] || item?.productId?.images?.[0] || item?.product?.images?.[0];

  return (
    <div className="flex gap-4 p-4 hover:bg-gray-50 transition-colors" dir="rtl">
      {/* תמונה */}
      <div className="flex-shrink-0">
        <img
          src={image}
          alt={title}
          className="h-24 w-24 lg:h-28 lg:w-28 rounded-xl object-cover border border-gray-200"
        />
      </div>

      {/* פרטי מוצר */}
      <div className="flex-1 flex flex-col justify-between min-w-0">
        {/* שם מוצר */}
        <div>
          <h3 className="font-semibold text-gray-900 text-base lg:text-lg mb-1">
            {title}
          </h3>
          
          {/* פרטים נוספים אם יש */}
          {item?.snapshot?.description && (
            <p className="text-sm text-gray-600 line-clamp-2">
              {item.snapshot.description}
            </p>
          )}
        </div>

        {/* מחיר וכמות */}
        <div className="flex items-end justify-between gap-4 mt-2">
          <div className="flex gap-4 text-sm lg:text-base">
            <div>
              <span className="text-gray-600">מחיר: </span>
              <span className="font-semibold text-gray-900">
                ₪{unitPrice.toLocaleString("he-IL")}
              </span>
            </div>
            <div>
              <span className="text-gray-600">כמות: </span>
              <span className="font-semibold text-gray-900">{quantity}</span>
            </div>
          </div>

          {/* סה"כ */}
          <div className="text-left">
            <p className="text-xs text-gray-600 mb-1">סה"כ</p>
            <p className="text-lg lg:text-xl font-bold text-[#ED6A23]">
              ₪{totalPrice.toLocaleString("he-IL")}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

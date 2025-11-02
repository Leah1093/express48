// components/checkout/OrderSummary.jsx
import React, { useMemo, useState } from "react";
import CheckoutButton from "./CheckoutButton";
import { useSelector } from "react-redux";
import { selectCartItems } from "../../../redux/slices/cartSelectors";
import axios from "axios";

export default function OrderSummary({ selectedItems }) {
  const [coupon, setCoupon] = useState("");
  const [couponApplied, setCouponApplied] = useState(null);
  const [message, setMessage] = useState("");
  const [discount, setDiscount] = useState(0);

  const getUnitPrice = (it) =>
    Number(it?.unitPrice ?? it?.productId?.price ?? it?.product?.price ?? it?.price ?? 0);
  const getQty = (it) => Number(it?.quantity ?? 0);

  // חישובי סכומים לפי המוצרים שנבחרו
  const subtotal = useMemo(() => {
    return Array.isArray(selectedItems)
      ? selectedItems
        // .filter((it) => selectedItems.includes(getKey(it)))
        .reduce((sum, it) => sum + getUnitPrice(it) * getQty(it), 0)
      : 0;
  }, [selectedItems]);

  // const discount = couponApplied ? Math.round(subtotal * 0.1) : 0;
    // חישוב משלוח
  const shipping =
    subtotal - discount <= 0 || subtotal - discount >= 300 ? 0 : 25;
     // סכום סופי
  const grandTotal = Math.max(subtotal - discount + shipping, 0);

  // const handleApplyCoupon = () => {
  //   if (!coupon.trim()) return;
  //   setCouponApplied({ code: coupon.trim().toUpperCase(), discount: "10%" });
  //   setCoupon("");
  // };

  

  const handleApplyCoupon = async () => {
    try {
      // const sellers = selectedItems.map(it => it.sellerId);
      const res = await axios.post(
        "https://api.express48.com/coupons/validate",
        { code: coupon, cart:{ total: subtotal },  },
        { withCredentials: true }
      );

      if (res.data.valid) {
        setDiscount(res.data.discount);
        setCouponApplied(res.data.finalTotal);
        setMessage(`קופון הוחל בהצלחה! הנחה: ₪${res.data.discount}`);
      }
    } catch (err) {
      setMessage(err.response?.data?.error || "שגיאה בהחלת הקופון");
    }
  };


  return (
    <aside className="ml-auto max-w-sm w-full">
      <div className="sticky top-4 space-y-4">
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-xl font-bold">סיכום הזמנה</h2>

          {/* שדה קופון */}
          <div className="mt-4 flex gap-2 max-w-sm">
            <input
              type="text"
              value={coupon}
              onChange={(e) => setCoupon(e.target.value)}
              placeholder="קוד קופון"
              className="flex-1 rounded-lg border border-gray-300 px-3 py-2 focus:border-[#0E3556] focus:outline-none"
            />
            <button
              onClick={handleApplyCoupon}
              className="whitespace-nowrap rounded-lg bg-[#0E3556] px-4 py-2 font-medium text-white hover:brightness-110 active:brightness-95"
            >
              החלת קופון
            </button>
          </div>

          <div className="flex items-center justify-between py-2">
            <span className="text-gray-700">סכום ביניים</span>
            <span className="font-semibold">
              {subtotal.toLocaleString("he-IL")} ₪
            </span>
          </div>

          <hr className="my-3" />

          <div className="flex items-center justify-between py-2">
            <span className="text-gray-700">משלוח</span>
            <span className="font-medium">
              {shipping === 0 ? "חינם" : `${shipping} ₪`}
            </span>
          </div>

          {couponApplied && (
            <div className="flex items-center justify-between py-2">
              <span className="text-gray-700">
                קופון ({couponApplied.code})
              </span>
              <span className="font-medium text-green-600">
               ₪  {discount.toLocaleString("he-IL")} −  
              </span>
            </div>
          )}

          <hr className="my-3" />

          <div className="flex items-center justify-between py-2 text-lg">
            <span className="font-bold">לתשלום</span>
            <span className="font-extrabold">
              {grandTotal.toLocaleString("he-IL")} ₪
            </span>
          </div>




        </div>
      </div>
    </aside>
  );
}

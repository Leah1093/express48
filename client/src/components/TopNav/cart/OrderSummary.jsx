// components/checkout/OrderSummary.jsx
import React, { useMemo, useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { selectCartItems } from "../../../redux/slices/cartSelectors";
import { fetchAddresses } from "../../../redux/thunks/addressThunks";
import axios from "axios";

export default function OrderSummary({ selectedItems }) {
  const [coupon, setCoupon] = useState("");
  const [couponApplied, setCouponApplied] = useState(null);
  const [message, setMessage] = useState("");
  const [discount, setDiscount] = useState(0);

  const { user, loading: userLoading, initialized } = useSelector((state) => state.user);
  const { list: addresses, loading: addrLoading } = useSelector((state) => state.addresses);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      dispatch(fetchAddresses());
    }
  }, [user, dispatch]);

  const handleCheckoutClick = () => {
    if (userLoading && !initialized) return;
    if (!user) {
      navigate("/login", { state: { from: "/payment" } });
      return;
    }
    // ✅ עובר לדף התשלום (שכולל כתובת + מוצרים + תשלום)
    navigate("/payment");
  };

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
    subtotal - discount <= 0 || subtotal - discount >= 300 ? 0 : 0;
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
        `${import.meta.env.VITE_API_URL || "http://localhost:8080"}/coupons/validate`,
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
    <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm" dir="rtl">
      <h2 className="text-xl font-bold mb-6 text-gray-900 text-right">סיכום הזמנה</h2>

      {/* פרטי סכומים */}
      <div className="space-y-3 mb-6">
        <div className="flex items-center justify-between text-gray-700">
          <span>מוצרים</span>
          <span className="font-medium">₪{subtotal.toLocaleString("he-IL")}</span>
        </div>

        <div className="flex items-center justify-between text-gray-700">
          <span>משלוח</span>
          <span className="font-medium">{shipping === 0 ? "חינם" : `₪${shipping}`}</span>
        </div>

        {couponApplied && (
          <div className="flex items-center justify-between text-green-600">
            <span>קופון ({couponApplied.code})</span>
            <span className="font-semibold">-₪{discount.toLocaleString("he-IL")}</span>
          </div>
        )}
      </div>

      <hr className="my-4 border-gray-200" />

      {/* סך הכל */}
      <div className="flex items-center justify-between mb-6">
        <span className="text-lg font-bold text-gray-900">סך הכל</span>
        <span className="text-xl font-bold text-gray-900">₪{grandTotal.toLocaleString("he-IL")}</span>
      </div>

      {/* כפתור להשלים */}
      <button 
        onClick={handleCheckoutClick}
        disabled={(userLoading && !initialized) || addrLoading}
        className="w-full bg-black text-white font-bold py-4 rounded-xl hover:bg-gray-800 transition-all mb-6 disabled:opacity-50 cursor-pointer"
      >
       לתשלום
      </button>

      {/* קוד קופון */}
      <div className="mb-3 text-right">
        <p className="text-gray-700 font-medium">קוד קופון</p>
      </div>
      
      {/* שדה קופון */}
      <div className="flex gap-2">
        <input
          type="text"
          value={coupon}
          onChange={(e) => setCoupon(e.target.value)}
          placeholder="הזן קוד קופון"
          className="flex-1 min-w-0 rounded-lg border border-gray-300 px-3 py-3 text-right focus:border-[#ED6A23] focus:outline-none"
        />
        <button
          onClick={handleApplyCoupon}
          className="whitespace-nowrap rounded-lg bg-[#ED6A23] px-4 py-3 font-bold text-white hover:brightness-110 active:brightness-95 cursor-pointer"
        >
          החלת קופון
        </button>
      </div>

      {message && (
        <p className="mt-3 text-sm text-gray-600 text-right">{message}</p>
      )}
    </div>
  );
}

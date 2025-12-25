import React, { useMemo, useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { fetchAddresses } from "../../../redux/thunks/addressThunks";
import axios from "axios";

export default function OrderSummary({ selectedItems }) {
  const [coupon, setCoupon] = useState("");
  const [couponApplied, setCouponApplied] = useState(null);
  const [message, setMessage] = useState("");
  const [discount, setDiscount] = useState(0);

  const {
    user,
    loading: userLoading,
    initialized,
  } = useSelector((state) => state.user);
  const { loading: addrLoading } = useSelector((state) => state.addresses);
  //   const { user, loading: userLoading, initialized } = useSelector((state) => state.user);
  //   const { list: addresses, loading: addrLoading } = useSelector((state) => state.addresses);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // פורמט בטוח לשקלים
  const formatIls = (value) => {
    const n = Number(value ?? 0);
    if (!Number.isFinite(n)) return "0";
    return n.toLocaleString("he-IL");
  };

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
    // מעבר לדף התשלום
    navigate("/payment");
  };

  const getUnitPrice = (it) =>
    Number(
      it?.unitPrice ??
        it?.productId?.price ??
        it?.product?.price ??
        it?.price ??
        0
    );

  const getQty = (it) => Number(it?.quantity ?? 0);

  // סכום מוצרים לפי הפריטים שנבחרו
  const subtotal = useMemo(() => {
    return Array.isArray(selectedItems)
      ? selectedItems.reduce(
          (sum, it) => sum + getUnitPrice(it) * getQty(it),
          0
        )
      : 0;
  }, [selectedItems]);

  const safeDiscount =
    typeof discount === "number" && !Number.isNaN(discount) ? discount : 0;

  // משלוח: חינם מעל 300 או אם אחרי הנחה יוצא 0
  const shipping =
    subtotal - safeDiscount <= 0 || subtotal - safeDiscount >= 300 ? 0 : 25;

  // סכום סופי
  const grandTotal = Math.max(subtotal - safeDiscount + shipping, 0);

  const handleApplyCoupon = async () => {
    if (!coupon.trim()) {
      setMessage("נא להזין קוד קופון");
      return;
    }

    try {
      const safeItems = Array.isArray(selectedItems) ? selectedItems : [];

      const cartPayload = {
        total: subtotal,
        items: safeItems
          .map((it) => {
            const productId =
              it.productId?._id ||
              it.product?._id ||
              it._id ||
              it.productId ||
              null;

            const sellerIdRaw =
              it.sellerId ||
              it.productId?.sellerId || // 👈 חשוב להוסיף
              it.product?.sellerId ||
              it.snapshot?.sellerId ||
              null;

            if (!productId) return null;

            // 👇 פה היה חסר לך ה-return
            return {
              _id: productId,
              sellerId: sellerIdRaw ? String(sellerIdRaw) : null,
              quantity: getQty(it),
              // לא חובה אבל עדיף:
              price: getUnitPrice(it),
            };
          })
          .filter(Boolean),
      };

      console.log("coupon validate payload cart:", cartPayload);

      const apiBase = import.meta.env.VITE_API_URL || "http://localhost:8080";

      const res = await axios.post(
        `${apiBase}/coupons/validate`,
        {
          code: coupon.trim(),
          cart: cartPayload,
        },
        { withCredentials: true }
      );

      if (res.data.valid) {
        const rawDiscount = res.data.discount;
        const numericDiscount =
          typeof rawDiscount === "number" && !Number.isNaN(rawDiscount)
            ? rawDiscount
            : 0;

        setDiscount(numericDiscount);

        setCouponApplied({
          code: coupon.trim(),
          finalTotal: res.data.finalTotal,
        });

        setCoupon("");
        setMessage(`קופון הוחל בהצלחה! הנחה: ₪${formatIls(numericDiscount)}`);
      } else {
        setMessage(res.data.error || "קופון לא תקף");
      }
    } catch (err) {
      console.error("coupon validate error:", err);
      setMessage(err?.response?.data?.error || "שגיאה בהחלת הקופון");
    }
  };

  return (
    <div
      className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm"
      dir="rtl"
    >
      <h2 className="text-xl font-bold mb-6 text-gray-900 text-right">
        סיכום הזמנה
      </h2>

      {/* פרטי סכומים */}
      <div className="space-y-3 mb-6">
        <div className="flex items-center justify-between text-gray-700">
          <span>מוצרים</span>
          <span className="font-medium">₪{formatIls(subtotal)}</span>
        </div>

        <div className="flex items-center justify-between text-gray-700">
          <span>משלוח</span>
          <span className="font-medium">
            {shipping === 0 ? "חינם" : `₪${formatIls(shipping)}`}
          </span>
        </div>

        {couponApplied && (
          <div className="flex items-center justify-between text-green-600">
            <span>קופון ({couponApplied.code})</span>
            <span className="font-semibold">-₪{formatIls(safeDiscount)}</span>
          </div>
        )}
      </div>

      <hr className="my-4 border-gray-200" />

      {/* סך הכל */}
      <div className="flex items-center justify-between mb-6">
        <span className="text-lg font-bold text-gray-900">סך הכל</span>
        <span className="text-xl font-bold text-gray-900">
          ₪{formatIls(grandTotal)}
        </span>
      </div>

      {/* כפתור לתשלום */}
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

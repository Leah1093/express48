import React, { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { selectCartItems } from "../../../redux/slices/cartSelectors";
import CartItemsTable from "./CartItemsTable";
import CartRow from "./CartRow";
import CheckoutButton from "./CheckoutButton"
import { useSelector, useDispatch } from "react-redux";
import OrderSummary from "./OrderSummary";
import { toggleItemSelectedThunk, toggleSelectAllThunk } from "../../../redux/thunks/cartThunks.js";
import { toggleGuestItemSelected, toggleGuestSelectAll } from "../../../redux/slices/guestCartSlice";


export default function CartPage() {

  const user = useSelector((state) => state.user.user);
  const rawItems = useSelector(selectCartItems);
  const navigate = useNavigate();
  console.log("rawItems מה־redux:", rawItems);

  const dispatch = useDispatch();

  const getKey = (item) =>
    item._id ||
    item.id ||
    item?.product?._id ||
    (typeof item?.productId === "object" ? item.productId._id : item?.productId);

  // פונקציות עזר ליחידת מחיר וכמות גם כשהמבנה שונה
  const getUnitPrice = (it) =>
    Number(it?.unitPrice ?? it?.productId?.price ?? it?.product?.price ?? it?.price ?? 0);
  const getQty = (it) => Number(it?.quantity ?? 0);


  const subtotal = useMemo(() => {
    return Array.isArray(rawItems)
      ? rawItems
        .filter((it) => it.selected)
        .reduce((sum, it) => sum + getUnitPrice(it) * getQty(it), 0)
      : 0;
  }, [rawItems]);


  const [coupon, setCoupon] = useState("");
  const [couponApplied, setCouponApplied] = useState(null);

  const discount = couponApplied ? Math.round(subtotal * 0.1) : 0;
  const shipping = (subtotal - discount <= 0 || subtotal - discount >= 300) ? 0 : 25;
  const grandTotal = Math.max(subtotal - discount + shipping, 0);

  const handleCheckoutClick = () => {
    if (!user) {
      navigate("/login", { state: { from: "/payment" } });
      return;
    }
    navigate("/payment");
  };

  // const handleApplyCoupon = () => {
  //   if (!coupon.trim()) return;
  //   setCouponApplied({ code: coupon.trim().toUpperCase(), discount: "10%" });
  //   setCoupon("");
  // };


  const allSelected = rawItems.length > 0 && rawItems.every((it) => it.selected);

  const toggleSelectAll = () => {
    if (user) {
      dispatch(toggleSelectAllThunk(!allSelected));
    } else {
      dispatch(toggleGuestSelectAll(!allSelected));
    }

  };

  // 👇 כאן מגדירים את ה־SelectableCartRow
  function SelectableCartRow({ item }) {
    const id = getKey(item);
    const handleChange = (e) => {
      const selected = e.target.checked;

      if (user) {
        // ✅ משתמש רשום → עדכון בשרת
        dispatch(toggleItemSelectedThunk({ itemId: id, selected }));
      } else {
        // ❌ אורח → עדכון ב־localStorage
        dispatch(toggleGuestItemSelected({ productId: item.product?._id || id, selected }))
      }
    };

    return (
      <div className="px-3 py-3 lg:px-6 lg:py-5 hover:bg-gray-50 transition-colors">
        {/* 🖥️ Desktop: שורה רגילה */}
        <div className="hidden lg:flex items-center gap-4">
          {/* Checkbox */}
          <div className="flex-shrink-0">
            <input
              type="checkbox"
              checked={item.selected || false}
              onChange={handleChange}
              style={{ accentColor: '#ED6A23' }}
              className="w-5 h-5 cursor-pointer"
            />
          </div>
          
          {/* תוכן המוצר - דסקטופ */}
          <div className="flex-1">
            <CartRow item={item} />
          </div>
        </div>

        {/* 📱 Mobile: פריסה אנכית */}
        <div className="lg:hidden flex gap-3">
          {/* Checkbox */}
          <div className="flex-shrink-0 pt-1">
            <input
              type="checkbox"
              checked={item.selected || false}
              onChange={handleChange}
              style={{ accentColor: '#ED6A23' }}
              className="w-4 h-4 cursor-pointer"
            />
          </div>

          {/* תוכן המוצר - מובייל */}
          <div className="flex-1">
            <CartRow item={item} isMobile={true} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div dir="rtl" className="min-h-screen bg-gray-50 pb-24 lg:pb-0">
      <div className="mx-auto max-w-7xl px-4 py-4 lg:py-8">
        
        {/* מסגרת ראשית סביב הכל */}
        <div className="border border-gray-300 rounded-3xl bg-white p-4 lg:p-8 shadow-sm">
          
          {/* כותרת */}
          <div className="mb-4 lg:mb-8 text-right">
            <h1 className="text-xl lg:text-2xl font-bold text-gray-900">עגלת קניות</h1>
          </div>

          {/* Grid - מוצרים בימין וסיכום בשמאל (דסקטופ בלבד) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
            
            {/* סיכום הזמנה - מוסתר במובייל, מוצג בדסקטופ */}
            <aside className="hidden lg:block lg:col-span-4 order-2 lg:order-2">
              <OrderSummary selectedItems={rawItems.filter((it) => it.selected)} />
            </aside>

            {/* פריטי העגלה */}
            <section className="lg:col-span-8 order-1 lg:order-1">
              
              {/* רשימת מוצרים */}
              {!rawItems.length ? (
                <div className="rounded-2xl bg-gray-50 p-12 text-center">
                  <svg className="mx-auto mb-4 opacity-20" width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <circle cx="9" cy="21" r="1"></circle>
                    <circle cx="20" cy="21" r="1"></circle>
                    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                  </svg>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">העגלה שלך ריקה</h3>
                  <p className="text-gray-600 mb-6">הוסף מוצרים כדי להתחיל לקנות</p>
                  <a
                    href="/"
                    className="inline-block px-6 py-3 bg-[#ED6A23] text-white font-semibold rounded-xl hover:brightness-110 transition-all"
                  >
                    חזור לחנות
                  </a>
                </div>
              ) : (
                <>
                  {/* מסגרת סביב כל המוצרים */}
                  <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
                    
                    {/* כותרות עמודות - רק בדסקטופ */}
                    <div className="hidden lg:flex items-center gap-4 px-6 py-4 bg-gray-50 border-b border-gray-200" dir="rtl">
                      <div className="flex-shrink-0 w-5"></div> {/* מקום ל-checkbox */}
                      <div className="flex-shrink-0 w-20"></div> {/* מקום לתמונה */}
                      <div className="flex-1 text-right">
                        <span className="font-semibold text-gray-700">מוצרים</span>
                      </div>
                      <div className="text-center min-w-[80px]">
                        <span className="font-semibold text-gray-700">מחיר</span>
                      </div>
                      <div className="flex-shrink-0 text-center" style={{width: '120px'}}>
                        <span className="font-semibold text-gray-700">כמות</span>
                      </div>
                      <div className="flex-shrink-0 w-10"></div> {/* מקום למחיקה */}
                    </div>

                    <div className="divide-y divide-gray-100">
                      {/* רשימת מוצרים */}
                      {rawItems.map((item) => (
                        <SelectableCartRow key={getKey(item)} item={item} />
                      ))}
                    </div>
                  </div>

                  {/* כפתור חזרה לחנות */}
                  <div className="mt-4 lg:mt-6 text-center lg:text-right">
                    <a
                      href="/"
                      className="inline-block w-full lg:w-auto px-6 lg:px-8 py-3 border-2 border-[#ED6A23] text-[#ED6A23] font-semibold rounded-xl hover:bg-orange-50 transition-all cursor-pointer text-center"
                    >
                      חזרה לחנות
                    </a>
                  </div>
                </>
              )}
            </section>

          </div>
        </div>
      </div>

      {/* 📱 כפתור קופה נצמד לתחתית - רק במובייל */}
      {rawItems.length > 0 && rawItems.some((it) => it.selected) && (
        <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 shadow-2xl z-40">
          <div className="flex items-center justify-between gap-4">
            <div className="text-right">
              <p className="text-xs text-gray-600 mb-1">סך הכל</p>
              <p className="text-xl font-bold text-gray-900">
                ₪{grandTotal.toLocaleString("he-IL")}
              </p>
            </div>
            <button
              onClick={handleCheckoutClick}
              className="flex-1 bg-[#ED6A23] text-white font-bold py-4 rounded-xl hover:brightness-110 transition-all cursor-pointer"
            >
              לתשלום
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

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
  // const grandTotal = Math.max(subtotal - discount + shipping, 0);

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
      <div className="flex items-center">
        <input
          type="checkbox"
          checked={item.selected || false} // ✅ מתוך השרת
          onChange={handleChange}

          className="w-5 h-5 cursor-pointer ml-2"
        />
        <CartRow item={item} />
      </div>
    );
  }

  return (
    <div dir="rtl" className="min-h-screen bg-gray-50">

      {/* אזור התוכן */}
      <div className="mx-auto max-w-7xl px-4 py-6">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* סיכום שמאלי */}

          <aside className="order-2 lg:order-2 lg:col-span-4">
            <OrderSummary selectedItems={rawItems.filter((it) => it.selected)} />
            <div className="mt-4">
              <CheckoutButton />
            </div>
          </aside>


          {/* פריטי העגלה */}
          <section className="order-1 lg:order-1 lg:col-span-8">
            <div className="mb-6 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
              <div className="text-sm text-gray-700">
                {shipping === 0 ? (
                  <span>!הזמנתך זכאית למשלוח חינם</span>
                ) : (
                  <span>אפשרות למשלוח תוצג במהלך התשלום בקופה.</span>
                )}
              </div>
              <div className="mt-4 border-t-4 border-dashed border-[#0E3556]" />
            </div>
            {rawItems.length > 0 && (
              <div className="flex items-center mb-2">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={toggleSelectAll}
                  className="w-5 h-5 cursor-pointer ml-2"
                />
                <span className="text-sm font-medium">לבחור הכל</span>
              </div>)}


            {/* כאן מחליפים את הרשימה הישנה */}
            {/* <CartItemsTable itemComponent={SelectableCartRow} /> */}
            {!rawItems.length ? (
              <div className="rounded-xl border bg-white p-6 text-center text-gray-500">
                העגלה ריקה
              </div>
            ) : (
              <div className="rounded-xl border bg-white shadow-sm overflow-y-auto">
                {rawItems.map((item) => (
                  <SelectableCartRow key={getKey(item)} item={item} />
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}

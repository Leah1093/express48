import React, { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { useSelector } from "react-redux";
import { selectCartItems } from "../../../redux/slices/cartSelectors";
import CartItemsTable from "./CartItemsTable";
import CartRow from "./CartRow";

export default function CartPage() {
  const navigate = useNavigate();

  // פריטים מה-Redux לחישוב סכומים
  const rawItems = useSelector(selectCartItems);

  const [selectedItems, setSelectedItems] = useState([]);

  // פונקציות עזר ליחידת מחיר וכמות גם כשהמבנה שונה
  const getUnitPrice = (it) =>
    Number(it?.unitPrice ?? it?.productId?.price ?? it?.product?.price ?? it?.price ?? 0);
  const getQty = (it) => Number(it?.quantity ?? 0);

  // const subtotal = useMemo(
  //   () =>
  //     Array.isArray(rawItems)
  //       ? rawItems.reduce((sum, it) => sum + getUnitPrice(it) * getQty(it), 0)
  //       : 0,
  //   [rawItems]
  // );
  const subtotal = useMemo(() => {
    return Array.isArray(rawItems)
      ? rawItems
        .filter((it) => selectedItems.includes(it.product._id || it.product.id))
        .reduce((sum, it) => sum + getUnitPrice(it) * getQty(it), 0)
      : 0;
  }, [rawItems, selectedItems]);


  const [coupon, setCoupon] = useState("");
  const [couponApplied, setCouponApplied] = useState(null);

  const discount = couponApplied ? Math.round(subtotal * 0.1) : 0;
  const shipping = (subtotal - discount <= 0 || subtotal - discount >= 300) ? 0 : 25;
  const grandTotal = Math.max(subtotal - discount + shipping, 0);

  const handleApplyCoupon = () => {
    if (!coupon.trim()) return;
    setCouponApplied({ code: coupon.trim().toUpperCase(), discount: "10%" });
    setCoupon("");
  };

  // בתוך CartPage
  // בדיקה אם כל המוצרים נבחרו
  const allSelected = rawItems.length > 0 && selectedItems.length === rawItems.length;

  // פונקציה לבחירת מוצר בודד
  const toggleItemSelection = (id) => {
    setSelectedItems((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  // פונקציה לבחירת כל המוצרים
  const toggleSelectAll = () => {
    if (allSelected) {
      setSelectedItems([]);
    } else {
      setSelectedItems(rawItems.map((it) => it.product._id || it.product.id));
    }
  };
  // 👇 כאן מגדירים את ה־SelectableCartRow
  function SelectableCartRow({ item }) {
    const id = getKey(item);
    const selected = selectedItems.includes(id);

    return (
      <div className="flex items-center">
        <input
          type="checkbox"
          checked={selected}
          onChange={() => toggleItemSelection(id)}
          className="w-5 h-5 cursor-pointer ml-2"
        />
        <CartRow item={item} />
      </div>
    );
  }
  const getKey = (item) =>
    item._id ||
    item.id ||
    item?.product?._id ||
    (typeof item?.productId === "object" ? item.productId._id : item?.productId);



  return (
    <div dir="rtl" className="min-h-screen bg-gray-50">
      
      {/* אזור התוכן */}
      <div className="mx-auto max-w-7xl px-4 py-6">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* סיכום שמאלי */}
          <aside className="order-2 lg:order-2 lg:col-span-4">
            <div className="sticky top-4 space-y-4">
              <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                <h2 className="mb-4 text-xl font-bold">סך כל עגלת הקניות</h2>

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
                      − {discount.toLocaleString("he-IL")} ₪
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

                <button
                  type="button"
                  onClick={() => navigate("/checkout")}
                  className="mt-4 w-full rounded-lg bg-[#0E3556] px-4 py-3 font-semibold text-white hover:brightness-110 active:brightness-95"
                >
                  מעבר לתשלום
                </button>
              </div>
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





            {/* קופון */}
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
          </section>
        </div>
      </div>
    </div>
  );
}

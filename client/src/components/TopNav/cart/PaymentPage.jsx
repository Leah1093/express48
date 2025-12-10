
// src/components/TopNav/cart/PaymentPage.jsx
import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import axios from "../../../config/axios.config";
import { useNavigate } from "react-router-dom";

import { fetchAddresses } from "../../../redux/thunks/addressThunks";
import { selectCartItems } from "../../../redux/slices/cartSelectors";

import AddressCard from "./AddressCard";
import PaymentProductRow from "./PaymentProductRow";
import OrderSummary from "./OrderSummary";

export default function PaymentPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const rawItems = useSelector(selectCartItems);
  const chosenItems = rawItems.filter((it) => it.selected);

  const { user, loading: userLoading } = useSelector(
    (state) => state.user || {}
  );
  const {
    list: addresses,
    loading: addrLoading,
  } = useSelector(
    (state) => state.addresses || { list: [], loading: false }
  );

  const [payOpen, setPayOpen] = useState(false);
  const [iframeUrl, setIframeUrl] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  const [timeoutReached, setTimeoutReached] = useState(false);

  useEffect(() => {
    if (user) {
      dispatch(fetchAddresses());
    }
  }, [user, dispatch]);

  useEffect(() => {
    const timer = setTimeout(() => setTimeoutReached(true), 3000);
    return () => clearTimeout(timer);
  }, []);

  // טעינת משתמש
  if (userLoading) {
    if (timeoutReached) {
      return (
        <div
          className="min-h-screen flex items-center justify-center bg-gray-50 px-4"
          dir="rtl"
        >
          <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
            <h1 className="text-xl font-bold text-gray-900 mb-2">
              טעינת משתמש נכשלה
            </h1>
            <p className="text-gray-600 mb-6">
              לא הצלחנו לטעון את פרטי המשתמש. ייתכן שיש בעיית חיבור.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="bg-[#ED6A23] text-white px-6 py-2 rounded-lg cursor-pointer font-semibold hover:brightness-110 transition"
            >
              נסה שוב
            </button>
          </div>
        </div>
      );
    }

    return (
      <div
        className="min-h-screen flex items-center justify-center bg-gray-50 px-4"
        dir="rtl"
      >
        <p className="text-gray-600 text-lg">טוען פרטי משתמש...</p>
      </div>
    );
  }

  // לא מחובר
  if (!user) {
    return (
      <div
        className="min-h-screen flex items-center justify-center bg-gray-50 px-4"
        dir="rtl"
      >
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-3">
            יש להתחבר כדי לבצע תשלום
          </h1>
          <p className="text-gray-600 mb-6">
            כדי להמשיך לתשלום ולהשלים את ההזמנה, יש להתחבר למערכת.
          </p>
          <button
            onClick={() => navigate("/login")}
            className="bg-[#ED6A23] text-white px-6 py-3 rounded-xl cursor-pointer font-semibold hover:brightness-110 transition"
          >
            התחבר
          </button>
        </div>
      </div>
    );
  }

  // כתובת ברירת מחדל
  const defaultAddress =
    addresses && addresses.length > 0
      ? addresses.find((a) => a.isDefault) || addresses[0]
      : null;

  const getKey = (item) =>
    item._id ||
    item.id ||
    item?.product?._id ||
    (typeof item?.productId === "object" ? item.productId._id : item?.productId);

  // 🔹 פונקציה שמייצרת הזמנה ואז פותחת iframe של טרנזילה
  const startCardPayment = async () => {
    try {
      setBusy(true);
      setErr("");

      const items = chosenItems.map((it) => ({
        productId: it._id || it.productId?._id,
        quantity: it.quantity ?? it.qty ?? 1,
        price:
          it.price ??
          it.unitPrice ??
          it.productId?.price?.amount ??
          it.product?.price ??
          0,
        priceAfterDiscount: it.priceAfterDiscount,
      }));

      const payload = {
        addressId: defaultAddress?._id,
        notes: "",
        items,
      };

      console.log("PAYMENT PAYLOAD →", payload);

      // 1) יצירת הזמנה
      const orderRes = await axios.post("/orders", payload, {
        withCredentials: true,
      });

      const orderId = orderRes.data._id;
      console.log("ORDER CREATED →", orderId);

      // 2) בקשה לשרת לקבל iframeUrl מטרנזילה
      const { data } = await axios.post(
        "/payments/tranzila/iframe-url",
        { orderId, items },
        { withCredentials: true }
      );

      console.log("TRZ iframeUrl →", data.iframeUrl);

      setIframeUrl(data.iframeUrl);
      setPayOpen(true);
    } catch (e) {
      console.error("❌ startCardPayment error:", e?.response?.data || e);
      setErr("נכשל ביצירת דף תשלום");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 lg:py-10" dir="rtl">
      {/* HEADER & PROGRESS */}
      <header className="mb-6 lg:mb-10">
        <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-3">
          תשלום והשלמת הזמנה
        </h1>
        <p className="text-gray-600 text-sm lg:text-base mb-4">
          בדיקת פרטי משלוח, סקירת ההזמנה ותשלום מאובטח בכרטיס אשראי.
        </p>

        {/* פס צעדים */}
        <div className="flex items-center gap-3 text-xs lg:text-sm">
          {/* צעד 1 */}
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-[#ED6A23] text-white flex items-center justify-center font-bold">
              1
            </div>
            <span className="font-semibold text-gray-900">כתובת משלוח</span>
          </div>

          <div className="flex-1 h-px bg-gray-200 mx-2" />

          {/* צעד 2 */}
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-[#ED6A23] text-white flex items-center justify-center font-bold">
              2
            </div>
            <span className="font-semibold text-gray-900">סקירת מוצרים</span>
          </div>

          <div className="flex-1 h-px bg-gray-200 mx-2" />

          {/* צעד 3 */}
          <div className="flex items-center gap-2">
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center font-bold ${
                payOpen ? "bg-[#ED6A23] text-white" : "bg-gray-200 text-gray-500"
              }`}
            >
              3
            </div>
            <span
              className={`font-semibold ${
                payOpen ? "text-gray-900" : "text-gray-500"
              }`}
            >
              תשלום
            </span>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
        {/* צד שמאל / מרכז – פרטים ותשלום */}
        <div className="lg:col-span-8 space-y-6 lg:space-y-8">
          {/* כתובת למשלוח */}
          <section className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 lg:p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg lg:text-xl font-bold text-gray-900">
                כתובת למשלוח
              </h2>
              {addrLoading && (
                <span className="text-xs text-gray-400">טוען כתובות…</span>
              )}
            </div>
            <AddressCard
              user={user}
              address={defaultAddress}
              addresses={addresses}
            />
          </section>

          {/* מוצרים */}
          <section className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 lg:p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg lg:text-xl font-bold text-gray-900">
                פרטי מוצרים
              </h2>
              <span className="text-xs text-gray-500">
                {chosenItems.length} פריטים בתשלום
              </span>
            </div>

            {!chosenItems.length ? (
              <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 p-8 text-center text-gray-500">
                <p className="text-base lg:text-lg mb-2">
                  לא נבחרו מוצרים לתשלום
                </p>
                <button
                  onClick={() => navigate("/cart")}
                  className="mt-2 text-sm text-[#ED6A23] font-semibold hover:underline cursor-pointer"
                >
                  חזרה לעגלת הקניות
                </button>
              </div>
            ) : (
              <div className="rounded-xl border border-gray-200 bg-white overflow-hidden divide-y divide-gray-100">
                {chosenItems.map((item) => (
                  <PaymentProductRow key={getKey(item)} item={item} />
                ))}
              </div>
            )}
          </section>

          {/* כפתור תשלום + הודעות */}
          <section className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 lg:p-6 space-y-4">
            <h2 className="text-lg lg:text-xl font-bold text-gray-900">
              בחירת אמצעי תשלום
            </h2>

            <button
              onClick={startCardPayment}
              disabled={!chosenItems.length || busy || !defaultAddress}
              className="w-full rounded-xl bg-[#ED6A23] text-white py-3.5 px-6 font-semibold text-base lg:text-lg hover:brightness-110 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {busy ? "פותח תשלום..." : "תשלום בכרטיס אשראי"}
            </button>

            {err && (
              <p className="text-sm text-red-500 text-center bg-red-50 p-3 rounded-lg">
                {err}
              </p>
            )}

            {!defaultAddress && (
              <p className="text-sm text-amber-600 text-center bg-amber-50 p-3 rounded-lg">
                יש להוסיף כתובת למשלוח לפני ביצוע התשלום
              </p>
            )}

            <p className="text-xs text-gray-500 text-center">
              פרטי האשראי נקלטים במערכת סליקה מאובטחת. פרטי הכרטיס אינם נשמרים
              באתר.
            </p>
          </section>

          {/* iframe – חלק מהעמוד, אחרי לחיצה על תשלום */}
          {payOpen && iframeUrl && (
            <section className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 lg:p-6 space-y-4">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-lg lg:text-xl font-bold text-gray-900">
                  תשלום מאובטח בכרטיס אשראי
                </h2>
                <span className="text-xs text-gray-500">
                  חיבור מאובטח | SSL
                </span>
              </div>

              <div className="rounded-xl border border-gray-200 overflow-hidden bg-gray-50">
                <iframe
                  title="Tranzila Payment"
                  src={iframeUrl}
                  className="w-full h-[650px] md:h-[700px] border-0"
                  allow="payment *"
                  referrerPolicy="origin"
                  scrolling="yes"
                />
              </div>

              <p className="text-xs text-gray-500 text-center">
                התשלום מתבצע בדף מאובטח בהתאם לתקני חברות האשראי. פרטי הכרטיס
                אינם נשמרים במערכת שלנו.
              </p>
            </section>
          )}
        </div>

        {/* צד ימין – סיכום הזמנה */}
        <aside className="lg:col-span-4">
          <div className="lg:sticky lg:top-4 space-y-4">
            <OrderSummary
              selectedItems={rawItems.filter((it) => it.selected)}
            />
          </div>
        </aside>
      </div>
    </div>
  );
}

import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import axios from "../../../config/axios.config"; // ✅ axios עם config
import { fetchAddresses } from "../../../redux/thunks/addressThunks";
import AddressCard from "./AddressCard";
import { useNavigate } from "react-router-dom";
import { selectCartItems } from "../../../redux/slices/cartSelectors";
import PaymentProductRow from "./PaymentProductRow"; // ✅ קומפוננט ייעודי לדף תשלום
import OrderSummary from "./OrderSummary";
import SubmitOrderButton from "./SubmitOrderButton";

export default function PaymentPage() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const rawItems = useSelector(selectCartItems);
    const chosenItems = rawItems.filter((it) => it.selected);
    const URL = import.meta.env.VITE_API_URL;

    const { user, loading: userLoading } = useSelector((state) => state.user || {});
    const { list: addresses, loading: addrLoading } = useSelector((state) => state.addresses || { list: [], loading: false });

    const [payOpen, setPayOpen] = useState(false);
    const [iframeUrl, setIframeUrl] = useState("");
    const [busy, setBusy] = useState(false);
    const [err, setErr] = useState("");

    useEffect(() => {
        if (user) dispatch(fetchAddresses());
    }, [user, dispatch]);

    // הוספת timeout למניעת תקיעות
    const [timeoutReached, setTimeoutReached] = useState(false);
    useEffect(() => {
        const timer = setTimeout(() => setTimeoutReached(true), 3000); // 3 שניות במקום 5
        return () => clearTimeout(timer);
    }, []);

    // ✅ בדיקה רק של userLoading, לא של addrLoading
    if (userLoading) {
        if (timeoutReached) {
            return (
                <div className="text-center p-8">
                    <p className="text-red-500 mb-4">טעינת משתמש נכשלה</p>
                    <button onClick={() => window.location.reload()} className="bg-[#ED6A23] text-white px-6 py-2 rounded-lg cursor-pointer">
                        נסה שוב
                    </button>
                </div>
            );
        }
        return <p className="text-center p-8">טוען פרטי משתמש...</p>;
    }
    
    if (!user) return (
        <div className="text-center p-8">
            <p className="text-red-500 mb-4">יש להתחבר כדי לבצע תשלום</p>
            <button onClick={() => navigate('/login')} className="bg-[#ED6A23] text-white px-6 py-2 rounded-lg cursor-pointer">
                התחבר
            </button>
        </div>
    );
    
    // ✅ גם אם אין כתובות, תציג את הדף ותאפשר להוסיף כתובת
    const defaultAddress = addresses && addresses.length > 0 
        ? (addresses.find((a) => a.isDefault) || addresses[0])
        : null;

    const getKey = (item) =>
        item._id || item.id || item?.product?._id ||
        (typeof item?.productId === "object" ? item.productId._id : item?.productId);

    const startCardPayment = async () => {
        try {
            setBusy(true); setErr("");

            const items = chosenItems.map((it) => ({
                productId: it._id || it.productId?._id,
                quantity: it.quantity ?? it.qty ?? 1,
                price: it.unitPrice ??
                    it.productId?.price ??
                    it.product?.price ??
                    it.price,
                priceAfterDiscount: it.priceAfterDiscount,
            }));

            const payload = {
                addressId: defaultAddress._id,
                notes: "",
                items: items,
            };

            console.log("PAYLOAD", payload);


            const res = await axios.post(`${URL}/orders`, payload, {
                withCredentials: true,
            });

            const orderId = res.data._id;

            console.log('START PAYLOAD', { orderId, items });

            const { data } = await axios.post(`${URL}/payments/tranzila/iframe-url`, {
                orderId,
                items,
            });

            console.log('TRZ iframeUrl →', data.iframeUrl);


            setIframeUrl(data.iframeUrl);
            setPayOpen(true);
        } catch (e) {
            console.log(e);

            setErr("נכשל ביצירת דף תשלום");
        } finally {
            setBusy(false);
        }
    };

    return (
        <div className="max-w-7xl mx-auto px-4 py-6 lg:py-8" dir="rtl">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
                <div className="lg:col-span-8">
                    {/* כתובת למשלוח */}
                    <section className="mb-8">
                        <h2 className="text-xl lg:text-2xl font-bold mb-4 text-gray-900">כתובת למשלוח</h2>
                        <AddressCard user={user} address={defaultAddress} addresses={addresses} />
                    </section>

                    {/* פרטי מוצרים */}
                    <section className="mb-8">
                        <h2 className="text-xl lg:text-2xl font-bold mb-4 text-gray-900">פרטי מוצר</h2>
                        {!chosenItems.length ? (
                            <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center text-gray-500">
                                <p className="text-lg">לא נבחרו מוצרים לתשלום</p>
                            </div>
                        ) : (
                            <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden divide-y divide-gray-100">
                                {chosenItems.map((item) => (
                                    <PaymentProductRow key={getKey(item)} item={item} />
                                ))}
                            </div>
                        )}
                    </section>

                    {/* כפתורי תשלום */}
                    <section className="space-y-4">
                        <button
                            onClick={startCardPayment}
                            disabled={!chosenItems.length || busy || !defaultAddress}
                            className="w-full rounded-xl bg-[#ED6A23] text-white py-4 px-6 font-semibold text-lg hover:brightness-110 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                        >
                            {busy ? "פותח תשלום..." : "תשלום בכרטיס אשראי"}
                        </button>
                        {err && <p className="text-sm text-red-500 text-center bg-red-50 p-3 rounded-lg">{err}</p>}
                        {!defaultAddress && (
                            <p className="text-sm text-amber-600 text-center bg-amber-50 p-3 rounded-lg">
                                יש להוסיף כתובת למשלוח לפני ביצוע התשלום
                            </p>
                        )}
                    </section>
                </div>

                {/* סיכום הזמנה */}
                <aside className="lg:col-span-4">
                    <div className="lg:sticky lg:top-4">
                        <OrderSummary selectedItems={rawItems.filter((it) => it.selected)} />
                    </div>
                </aside>
            </div>

            {/* מודאל עם iFrame של טרנזילה */}
            {payOpen && (
                <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl w-full max-w-[500px] max-h-[90vh] shadow-xl flex flex-col">
                        <div className="flex items-center justify-between px-4 py-3 border-b flex-shrink-0">
                            <h2 className="font-semibold">תשלום מאובטח</h2>
                            <button onClick={() => setPayOpen(false)} className="text-gray-500 text-2xl hover:text-black">&times;</button>
                        </div>
                        <div className="flex-1 overflow-auto">
                            <iframe
                                title="Tranzila Payment"
                                src={iframeUrl}
                                className="w-full h-[700px] border-0"
                                allow="payment *"
                                referrerPolicy="origin"
                                scrolling="yes"
                            />
                        </div>
                        <div className="px-4 py-3 text-center text-xs text-gray-500 border-t flex-shrink-0">
                            תשלום מתבצע בדף מאובטח של טרנזילה
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

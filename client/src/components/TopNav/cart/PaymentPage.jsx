import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import axios from "axios";
import { fetchAddresses } from "../../../redux/thunks/addressThunks";
import AddressCard from "./AddressCard";
import { useNavigate } from "react-router-dom";
import { selectCartItems } from "../../../redux/slices/cartSelectors";
import CartRow from "../cart/CartRow";
import OrderSummary from "./OrderSummary";
import SubmitOrderButton from "./SubmitOrderButton";

export default function PaymentPage() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const rawItems = useSelector(selectCartItems);
    const chosenItems = rawItems.filter((it) => it.selected);
    const URL = import.meta.env.VITE_API_URL;

    const { user, loading: userLoading } = useSelector((state) => state.user);
    const { list: addresses, loading: addrLoading } = useSelector((state) => state.addresses);

    const [payOpen, setPayOpen] = useState(false);
    const [iframeUrl, setIframeUrl] = useState("");
    const [busy, setBusy] = useState(false);
    const [err, setErr] = useState("");

    useEffect(() => {
        if (user) dispatch(fetchAddresses());
    }, [user, dispatch]);

    if (userLoading || addrLoading) return <p className="text-center">טוען נתונים...</p>;
    if (!user || !addresses.length) return <p className="text-center text-red-500">לא נמצאו נתונים</p>;

    const defaultAddress = addresses.find((a) => a.isDefault) || addresses[0];

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
        <div className="max-w-7xl mx-auto py-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-8">
                    <h1 className="text-2xl font-bold mb-6">כתובת למשלוח</h1>
                    <AddressCard user={user} address={defaultAddress} addresses={addresses} />

                    <h1 className="text-2xl font-bold mb-6 mt-6">פרטי מוצר</h1>
                    {!chosenItems.length ? (
                        <div className="rounded-xl border bg-white p-6 text-center text-gray-500">
                            לא נבחרו מוצרים לתשלום
                        </div>
                    ) : (
                        <div className="rounded-xl border bg-white shadow-sm overflow-y-auto">
                            {chosenItems.map((item) => (
                                <CartRow key={getKey(item)} item={item} />
                            ))}
                        </div>
                    )}

                    {/* תשלום טרנזילה */}
                    <div className="mt-6 grid gap-3">
                        <button
                            onClick={startCardPayment}
                            disabled={!chosenItems.length || busy}
                            className="w-full rounded-xl bg-black text-white py-3 font-medium hover:opacity-90 disabled:opacity-50"
                        >
                            {busy ? "פותח תשלום..." : "תשלום בכרטיס אשראי (טרנזילה)"}
                        </button>
                        {err && <p className="text-sm text-red-500 text-center">{err}</p>}
                    </div>

                    {/* אפשר להשאיר גם את כפתור שליחת ההזמנה הקיים אם זה הגיוני אצלך */}
                    <div className="mt-6 text-center">
                        <SubmitOrderButton
                            chosenItems={chosenItems}
                            addressId={defaultAddress._id}
                            notes=""
                        />
                    </div>
                </div>

                <aside className="lg:col-span-4">
                    <OrderSummary selectedItems={rawItems.filter((it) => it.selected)} />
                </aside>
            </div>

            {/* מודאל עם iFrame של טרנזילה */}
            {payOpen && (
                <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl w-full max-w-[420px] shadow-xl">
                        <div className="flex items-center justify-between px-4 py-3 border-b">
                            <h2 className="font-semibold">תשלום מאובטח</h2>
                            <button onClick={() => setPayOpen(false)} className="text-gray-500">&times;</button>
                        </div>
                        <div className="p-0">
                            <iframe
                                title="Tranzila Payment"
                                src={iframeUrl}
                                className="w-full h-[560px]"
                                allow="payment *"
                                referrerPolicy="origin"
                            />

                        </div>
                        <div className="px-4 py-3 text-center text-xs text-gray-500 border-t">
                            תשלום מתבצע בדף מאובטח של טרנזילה
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

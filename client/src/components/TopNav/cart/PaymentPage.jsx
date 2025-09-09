import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { fetchAddresses } from "../../../redux/thunks/addressThunks";
import AddressCard from "./AddressCard";
import { useNavigate } from "react-router-dom";
import { selectCartItems } from "../../../redux/slices/cartSelectors";
import CartRow from "../cart/CartRow";
import OrderSummary from "./OrderSummary";
import SubmitOrderButton from "./SubmitOrderButton" 

export default function PaymentPage() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const rawItems = useSelector(selectCartItems);
   

    const getKey = (item) =>
        item._id ||
        item.id ||
        item?.product?._id ||
        (typeof item?.productId === "object" ? item.productId._id : item?.productId);

    // מסנן רק את המוצרים שנבחרו
    const chosenItems = rawItems.filter((it) => it.selected);


    // ניגשים לנתוני המשתמש מתוך ה־userSlice
    const { user, loading: userLoading } = useSelector((state) => state.user);

    // ניגשים לכתובות מתוך ה־addressSlice
    const { list: addresses, loading: addrLoading, error } = useSelector(
        (state) => state.addresses
    );

    // ברגע שיש משתמש – נביא את הכתובות שלו
    useEffect(() => {
        if (user) {
            dispatch(fetchAddresses());
        }
    }, [user, dispatch]);

    if (userLoading || addrLoading) {
        return <p className="text-center">טוען נתונים...</p>;
    }

    if (!user || !addresses.length) {
        return <p className="text-center text-red-500">לא נמצאו נתונים</p>;
    }

    // לוקחים את כתובת ברירת המחדל או את הראשונה
    const defaultAddress =
        addresses.find((a) => a.isDefault) || addresses[0];

    return (
        <div className="max-w-7xl mx-auto py-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* עמודה ראשית – כתובת ומוצרים */}
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
                    {/* כפתור שליחת הזמנה */}
                    {/* כפתור שליחת הזמנה */}
                    <div className="mt-6 text-center">
                        <SubmitOrderButton
                            chosenItems={chosenItems}
                            addressId={defaultAddress._id}
                            notes="" // או שדה הערות אם יש לך
                        />
                    </div>

                </div>

                {/* עמודת סיכום – בצד שמאל */}
                <aside className="lg:col-span-4">
                    <OrderSummary selectedItems={rawItems.filter((it) => it.selected)} />
                </aside>
            </div>
        </div>
    );

}

import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function SubmitOrderButton({ chosenItems, addressId, notes }) {
  const navigate = useNavigate();
  const user = useSelector((state) => state.user); // מתוך Redux


  const handleSubmitOrder = async () => {
    try {
      // בניית גוף הבקשה
      const payload = {
        addressId: addressId,  // מזהה כתובת
        notes: notes || "",
        items: chosenItems.map((it) => ({
          productId: it._id || it.productId?._id,
          quantity: it.quantity,
          price:
            it.unitPrice ??
            it.productId?.price ??
            it.product?.price ??
            it.price,
        })),
      };

      // שליחת ההזמנה לשרת
      const res = await axios.post(`${import.meta.env.VITE_API_URL || "http://localhost:8080"}/orders`, payload, {
        withCredentials: true, // כדי לשלוח cookies (JWT)
      });

      console.log("הזמנה נוצרה:", res.data);

      // מעבר לדף הצלחה
        navigate(`/order/success/${res.data._id}`);
    } catch (err) {
      console.error("שגיאה ביצירת הזמנה", err);
      alert("❌ שגיאה ביצירת ההזמנה");
    }
  };

  return (
    <button
      onClick={handleSubmitOrder}
      className="w-full lg:w-auto bg-[#ED6A23] hover:brightness-110 text-white font-bold py-3 lg:py-4 px-6 lg:px-8 rounded-xl shadow-lg transition-all cursor-pointer"
    >
      שליחת הזמנה
    </button>
  );
}

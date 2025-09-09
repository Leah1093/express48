// components/order/OrderSuccessPage.jsx
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { Lock } from "lucide-react";


export default function OrderSuccessPage() {
  const { id } = useParams(); // לוקח את מזהה ההזמנה מה־URL (/order/success/:id)
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const res = await axios.get(`http://localhost:8080/orders/${id}`, { withCredentials: true });
        setOrder(res.data);
      } catch (err) {
        console.error("שגיאה בטעינת ההזמנה:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [id]);

  if (loading) return <p className="text-center">טוען נתוני הזמנה...</p>;
  if (!order) return <p className="text-center text-red-500">ההזמנה לא נמצאה</p>;

  // חישוב תאריכים
  const orderDate = new Date(order.createdAt).toLocaleDateString("he-IL", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  const confirmationDate = new Date(order.createdAt).toLocaleDateString("he-IL", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  const deliveryDate = new Date(order.createdAt);
  deliveryDate.setDate(deliveryDate.getDate() + 7);

  return (
    <div className="max-w-3xl mx-auto py-10 px-4 space-y-6">
      <h1 className="text-2xl font-bold text-center text-green-700">
        ההזמנה נקלטה במערכת בהצלחה
      </h1>

      <div className="flex items-center justify-center text-gray-600 text-sm">
        <Lock size={16} className="ml-1" />
        כל הנתונים מוגנים
      </div>

      <div className="bg-gray-50 border rounded-lg p-4 space-y-2">
        <div className="flex justify-between text-sm">
          <span>מועד הזמנה:</span>
          <span>{orderDate}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span>מזהה הזמנה:</span>
          <span>{order.orderId}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span>אישור ההזמנה נשלח:</span>
          <span>{confirmationDate}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span>אל:</span>
          <span>{order.userId?.email}</span>
        </div>
      </div>

      <div className="border rounded-lg p-6 flex justify-between bg-white shadow">
        <div>
          <div className="font-bold">{order.userId?.username}</div>
          <div>{order.addressId?.street}</div>
          <div>
            {order.addressId?.city}, {order.addressId?.zip}, {order.addressId?.country}
          </div>
        </div>
        <div className="text-right text-gray-700">
          <div className="font-medium">מועד מסירה</div>
          <div>
            {deliveryDate.toLocaleDateString("he-IL", {
              day: "2-digit",
              month: "long",
              year: "numeric",
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

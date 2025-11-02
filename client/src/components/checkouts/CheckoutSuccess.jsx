import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
export default function CheckoutSuccess() {
  const [q] = useSearchParams();
  const order = q.get('order') || '';
  // אם נטען בתוך iframe – שוברים למסגרת העליונה
  useEffect(() => { try { if (window.top !== window.self) window.top.location = window.location; } catch {} }, []);
  return (
    <div className="max-w-md mx-auto py-16 text-center">
      <h1 className="text-2xl font-bold">תודה!</h1>
      <p className="text-gray-600">התשלום התקבל, ההזמנה נקלטה.</p>
      {order && <p className="text-xs text-gray-400 mt-2">מס׳ הזמנה: {order}</p>}
    </div>
  );
}


import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { clearCartAsync } from '../../../redux/thunks/cartThunks';

export default function PaymentSuccess() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const dispatch = useDispatch();
  const orderId = searchParams.get('order');

  useEffect(() => {
    // מנקים את העגלה אחרי תשלום מוצלח
    dispatch(clearCartAsync());
  }, [dispatch]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50 p-4" dir="rtl">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center">
        {/* אייקון הצלחה */}
        <div className="w-20 h-20 bg-green-100 rounded-full mx-auto flex items-center justify-center mb-6">
          <svg className="w-12 h-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>

        {/* כותרת */}
        <h1 className="text-3xl font-bold text-gray-800 mb-4">
          תשלום בוצע בהצלחה! 🎉
        </h1>

        {/* תיאור */}
        <p className="text-gray-600 mb-6">
          תודה על ההזמנה! קיבלנו את התשלום בהצלחה.
        </p>

        {/* פרטי הזמנה */}
        {orderId && (
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <p className="text-sm text-gray-500 mb-1">מספר הזמנה:</p>
            <p className="text-xl font-semibold text-gray-800">{orderId}</p>
          </div>
        )}

        {/* הודעה נוספת */}
        <p className="text-sm text-gray-500 mb-8">
          אישור הזמנה נשלח למייל שלך. ניצור איתך קשר בהקדם.
        </p>

        {/* כפתורים */}
        <div className="space-y-3">
          <button
            onClick={() => navigate('/orders')}
            className="w-full bg-[#ED6A23] hover:bg-[#d65a13] text-white font-semibold py-3 px-6 rounded-lg transition-colors cursor-pointer"
          >
            הצג את ההזמנות שלי
          </button>
          <button
            onClick={() => navigate('/')}
            className="w-full bg-white hover:bg-gray-50 text-gray-700 font-semibold py-3 px-6 rounded-lg border-2 border-gray-200 transition-colors cursor-pointer"
          >
            חזור לעמוד הבית
          </button>
        </div>
      </div>
    </div>
  );
}

import { useNavigate, useSearchParams } from 'react-router-dom';

export default function PaymentFailed() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('order');

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-orange-50 p-4" dir="rtl">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center">
        {/* אייקון כישלון */}
        <div className="w-20 h-20 bg-red-100 rounded-full mx-auto flex items-center justify-center mb-6">
          <svg className="w-12 h-12 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>

        {/* כותרת */}
        <h1 className="text-3xl font-bold text-gray-800 mb-4">
          התשלום נכשל 😞
        </h1>

        {/* תיאור */}
        <p className="text-gray-600 mb-6">
          מצטערים, לא הצלחנו להשלים את התשלום. אנא נסה שוב.
        </p>

        {/* פרטי הזמנה */}
        {orderId && (
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <p className="text-sm text-gray-500 mb-1">מספר הזמנה:</p>
            <p className="text-xl font-semibold text-gray-800">{orderId}</p>
          </div>
        )}

        {/* סיבות אפשריות */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-8 text-right">
          <p className="text-sm font-semibold text-yellow-800 mb-2">סיבות אפשריות:</p>
          <ul className="text-sm text-yellow-700 space-y-1">
            <li>• פרטי כרטיס האשראי שגויים</li>
            <li>• אין יתרה מספקת בכרטיס</li>
            <li>• הכרטיס חסום לעסקאות באינטרנט</li>
            <li>• בעיית תקשורת זמנית</li>
          </ul>
        </div>

        {/* כפתורים */}
        <div className="space-y-3">
          <button
            onClick={() => navigate('/payment')}
            className="w-full bg-[#ED6A23] hover:bg-[#d65a13] text-white font-semibold py-3 px-6 rounded-lg transition-colors cursor-pointer"
          >
            נסה שוב
          </button>
          <button
            onClick={() => navigate('/cart')}
            className="w-full bg-white hover:bg-gray-50 text-gray-700 font-semibold py-3 px-6 rounded-lg border-2 border-gray-200 transition-colors cursor-pointer"
          >
            חזור לעגלת הקניות
          </button>
          <button
            onClick={() => navigate('/')}
            className="w-full text-gray-500 hover:text-gray-700 font-medium py-2 transition-colors cursor-pointer"
          >
            חזור לעמוד הבית
          </button>
        </div>
      </div>
    </div>
  );
}

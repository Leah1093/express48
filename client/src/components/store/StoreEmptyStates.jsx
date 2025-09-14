import React from 'react';

export const LoadingBox = () => (
  <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 py-10 text-gray-600">
    טוען חנות...
  </div>
);

export const ErrorBox = ({ message = 'תקלה זמנית' }) => (
  <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 py-10">
    <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3">
      {message}
    </div>
  </div>
);

export const EmptyStore = () => (
  <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 py-10">
    <div className="bg-gray-50 border rounded-lg px-4 py-6 text-gray-600">
      לא נמצאה חנות להצגה.
    </div>
  </div>
);

export const EmptyProducts = () => (
  <div className="bg-gray-50 border rounded-lg px-4 py-6 text-gray-600">
    אין מוצרים להצגה.
  </div>
);

export const LoadingInline = () => (
  <div className="text-gray-500 text-sm">טוען מוצרים...</div>
);

export const ErrorInline = ({ message = 'שגיאה' }) => (
  <div className="text-red-600 text-sm">{message}</div>
);

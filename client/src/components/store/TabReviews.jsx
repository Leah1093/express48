import React from 'react';

const TabReviews = ({ store }) => {
  const rating = store?.rating;
  return (
    <div className="space-y-3">
      <div className="bg-white border rounded-lg px-4 py-3">
        <div className="text-base font-medium">
          דירוג ממוצע: {rating?.average ? rating.average.toFixed(1) : '—'}{' '}
          <span className="text-sm text-gray-500">({rating?.count || 0} ביקורות)</span>
        </div>
      </div>

      <div className="bg-gray-50 border rounded-lg px-4 py-6 text-sm text-gray-600">
        רשימת ביקורות תוצג כאן.
      </div>
    </div>
  );
};

export default TabReviews;

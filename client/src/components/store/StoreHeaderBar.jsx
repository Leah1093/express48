import React from 'react';

const StoreHeaderBar = ({ store, showNameInHeader }) => {
  const c = store?.contact || {};
  const rating = store?.rating;

  return (
    <div className="w-full bg-white border-b">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 py-3">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div className="flex items-center gap-3">
            {store?.logoUrl && (
              <img
                src={store.logoUrl}
                alt={store?.name || 'לוגו'}
                className="w-12 h-12 rounded-full object-cover"
                loading="lazy"
              />
            )}

            {showNameInHeader && (
              <div>
                <div className="text-lg font-semibold">{store?.name}</div>
                {rating?.average ? (
                  <div className="text-sm text-gray-500">
                    ⭐ {rating.average.toFixed(1)} ({rating.count || 0})
                  </div>
                ) : null}
              </div>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-x-5 gap-y-1 text-sm text-gray-700">
            {c.showEmail && c.email ? <a href={`mailto:${c.email}`} className="hover:underline">✉ {c.email}</a> : null}
            {c.showPhone && c.phone ? <a href={`tel:${c.phone}`} className="hover:underline">☎ {c.phone}</a> : null}
            {c.showAddress && c.address ? <span>📍 {c.address}</span> : null}
            {store?.about?.showAbout && store?.about?.text ? <a href="#about" className="hover:underline">ℹ אודות</a> : null}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StoreHeaderBar;

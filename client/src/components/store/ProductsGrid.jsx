import React from 'react';

const ProductsGrid = ({ items }) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
      {items.map(p => (
        <article
          key={p.id}
          className="bg-white border rounded-lg overflow-hidden hover:shadow-sm transition-shadow"
        >
          <div className="aspect-[4/3] bg-gray-50">
            {p.image ? (
              <img src={p.image} alt={p.title} className="w-full h-full object-cover" loading="lazy" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">
                ללא תמונה
              </div>
            )}
          </div>
          <div className="p-3">
            <div className="text-xs text-gray-500">{p.brand || '\u00A0'}</div>
            <h3 className="text-sm font-medium line-clamp-2">{p.title}</h3>
            <div className="mt-2 flex items-center justify-between">
              <div className="font-semibold">{formatPrice(p.price)}</div>
              <div className={'text-xs ' + (p.inStock ? 'text-green-600' : 'text-red-500')}>
                {p.inStock ? 'במלאי' : 'אזל'}
              </div>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
};

function formatPrice(v) {
  if (typeof v !== 'number') return '₪—';
  return new Intl.NumberFormat('he-IL', { style: 'currency', currency: 'ILS', maximumFractionDigits: 0 }).format(v);
}

export default ProductsGrid;

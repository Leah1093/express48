import React from 'react';

const ProductFiltersBar = ({ value, onChange, total }) => {
  const onSort = (e) => onChange(s => ({ ...s, sort: e.target.value, page: 1 }));
  const onStock = (e) => onChange(s => ({ ...s, inStockOnly: e.target.checked, page: 1 }));

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 bg-white border rounded-lg px-3 py-2">
      <div className="text-sm text-gray-600">
        {typeof total === 'number' ? `סה״כ מוצרים: ${total}` : 'טעינת סיכום...'}
      </div>

      <div className="flex items-center gap-3">
        <label className="flex items-center gap-2 text-sm">
          <span>מיון:</span>
          <select
            value={value.sort}
            onChange={onSort}
            className="border rounded px-2 py-1 text-sm"
          >
            <option value="popular">פופולריות</option>
            <option value="new">חדש</option>
            <option value="priceLow">מחיר נמוך תחילה</option>
            <option value="priceHigh">מחיר גבוה תחילה</option>
          </select>
        </label>

        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={value.inStockOnly} onChange={onStock} />
          <span>במלאי בלבד</span>
        </label>
      </div>
    </div>
  );
};

export default ProductFiltersBar;

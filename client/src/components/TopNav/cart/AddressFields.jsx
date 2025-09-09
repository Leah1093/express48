
export default function AddressFields({ form, onChange }) {
  return (
    <>
      {/* מדינה / אזור */}
      <div className="flex flex-col">
        <label className="mb-1 text-sm font-medium">
          מדינה / אזור <span className="text-red-500">*</span>
        </label>
        <select
          name="country"
          value={form.country}
          onChange={onChange}
          required
          className="h-11 rounded-lg border border-gray-300 bg-white px-3 text-right outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
        >
          <option>ישראל</option>
          <option>United States</option>
          <option>United Kingdom</option>
          <option>Other</option>
        </select>
      </div>

      {/* כתובת רחוב */}
      <div className="flex flex-col">
        <label className="mb-1 text-sm font-medium">
          כתובת רחוב <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          name="street"
          value={form.street}
          onChange={onChange}
          required
          autoComplete="address-line1"
          className="h-11 rounded-lg border border-gray-300 bg-white px-3 text-right outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          placeholder="מספר בית ושם רחוב"
        />
      </div>

      {/* עיר */}
      <div className="flex flex-col">
        <label className="mb-1 text-sm font-medium">
          עיר <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          name="city"
          value={form.city}
          onChange={onChange}
          required
          autoComplete="address-level2"
          className="h-11 rounded-lg border border-gray-300 bg-white px-3 text-right outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
        />
      </div>

      {/* מיקוד */}
      <div className="flex flex-col">
        <label className="mb-1 text-sm font-medium">
          מיקוד <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          name="zip"
          value={form.zip}
          onChange={onChange}
          inputMode="numeric"
          autoComplete="postal-code"
          required
          className="h-11 rounded-lg border border-gray-300 bg-white px-3 text-right outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
        />
      </div>

      {/* טלפון */}
      {/* <div className="flex flex-col">
        <label className="mb-1 text-sm font-medium">טלפון (אופציונלי)</label>
        <input
          type="tel"
          name="phone"
          value={form.phone}
          onChange={onChange}
          inputMode="tel"
          autoComplete="tel"
          className="h-11 rounded-lg border border-gray-300 bg-white px-3 text-right outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
        />
      </div> */}

      {/* הערות */}
      <div className="flex flex-col">
        <label className="mb-1 text-sm font-medium">
          הערות להזמנה (אופציונלי)
        </label>
        <textarea
          name="notes"
          value={form.notes}
          onChange={onChange}
          rows={5}
          className="rounded-lg border border-gray-300 bg-white p-3 text-right outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          placeholder="הערות על ההזמנה, לדוגמה, הערות מיוחדות למסירה."
        />
      </div>
    </>
  );
}

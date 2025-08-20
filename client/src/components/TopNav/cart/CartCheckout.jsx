import React from "react";

export default function CartCheckout() {
  return (
    <div dir="rtl" className="min-h-screen bg-gray-50">
      {/* סרגל עליון + ניווט עוגיות */}
      <header className="bg-[#0f2a44] text-white">
        <div className="mx-auto max-w-7xl px-4 py-4">
          <nav className="flex items-center gap-3 text-sm">
            <a href="#" className="opacity-90 hover:opacity-100">
              עגלת קניות
            </a>
            <span className="opacity-70">/</span>
            <span className="font-semibold underline decoration-2 underline-offset-4">
              קופה
            </span>
            <span className="opacity-70">/</span>
            <a href="#" className="opacity-90 hover:opacity-100">
              הזמנת תשלום
            </a>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* עמודת ימין – הודעות + פרטי חיוב */}
          <section className="order-1 lg:order-none">
            {/* שורת הודעות עליונה */}
            <div className="mb-4 rounded-lg bg-white p-4 shadow-sm">
              <div className="flex flex-col gap-3 text-sm">
                <p className="leading-6">
                  <span className="font-medium">קנית כאן בעבר?</span>{" "}
                  <a
                    href="#"
                    className="text-blue-600 hover:text-blue-700 hover:underline"
                  >
                    יש ללחוץ כאן כדי להתחבר
                  </a>
                </p>
                <p className="leading-6">
                  <span className="font-medium">יש לך קופון?</span>{" "}
                  <a
                    href="#"
                    className="text-blue-600 hover:text-blue-700 hover:underline"
                  >
                    לחצו כאן כדי להזין את קוד הקופון
                  </a>
                </p>
              </div>
            </div>

            {/* כרטיס פרטי חיוב */}
            <div className="rounded-xl bg-white p-6 shadow-sm">
              <h2 className="mb-5 text-xl font-semibold">פרטי חיוב</h2>

              <form className="space-y-4">
                {/* שם פרטי + שם משפחה */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="flex flex-col">
                    <label className="mb-1 text-sm font-medium">
                      שם פרטי <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      autoComplete="given-name"
                      className="h-11 rounded-lg border border-gray-300 bg-white px-3 text-right outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                      placeholder=""
                      required
                    />
                  </div>

                  <div className="flex flex-col">
                    <label className="mb-1 text-sm font-medium">
                      שם משפחה <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      autoComplete="family-name"
                      className="h-11 rounded-lg border border-gray-300 bg-white px-3 text-right outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                      placeholder=""
                      required
                    />
                  </div>
                </div>

                {/* מדינה / אזור */}
                <div className="flex flex-col">
                  <label className="mb-1 text-sm font-medium">
                    מדינה / אזור <span className="text-red-500">*</span>
                  </label>
                  <select
                    className="h-11 rounded-lg border border-gray-300 bg-white px-3 text-right outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    defaultValue="ישראל"
                    required
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
                    autoComplete="address-line1"
                    className="h-11 rounded-lg border border-gray-300 bg-white px-3 text-right outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    placeholder="מספר בית ושם רחוב"
                    required
                  />
                  <input
                    type="text"
                    autoComplete="address-line2"
                    className="mt-2 h-11 rounded-lg border border-gray-300 bg-white px-3 text-right outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    placeholder="דירה, סוויטה, יחידה (אופציונלי)"
                  />
                </div>

                {/* עיר */}
                <div className="flex flex-col">
                  <label className="mb-1 text-sm font-medium">
                    עיר <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    autoComplete="address-level2"
                    className="h-11 rounded-lg border border-gray-300 bg-white px-3 text-right outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    required
                  />
                </div>

                {/* מיקוד / תא דואר */}
                <div className="flex flex-col">
                  <label className="mb-1 text-sm font-medium">
                    מיקוד / תא דואר <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    autoComplete="postal-code"
                    className="h-11 rounded-lg border border-gray-300 bg-white px-3 text-right outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    required
                  />
                </div>

                {/* טלפון (אופציונלי) */}
                <div className="flex flex-col">
                  <label className="mb-1 text-sm font-medium">
                    טלפון (אופציונלי)
                  </label>
                  <input
                    type="tel"
                    inputMode="tel"
                    autoComplete="tel"
                    className="h-11 rounded-lg border border-gray-300 bg-white px-3 text-right outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    placeholder=""
                  />
                </div>

                {/* כתובת אימייל */}
                <div className="flex flex-col">
                  <label className="mb-1 text-sm font-medium">
                    כתובת אימייל <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    autoComplete="email"
                    className="h-11 rounded-lg border border-gray-300 bg-white px-3 text-right outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    required
                  />
                </div>

                {/* הערות להזמנה (אופציונלי) */}
                <div className="flex flex-col">
                  <label className="mb-1 text-sm font-medium">
                    הערות להזמנה (אופציונלי)
                  </label>
                  <textarea
                    rows={5}
                    className="rounded-lg border border-gray-300 bg-white p-3 text-right outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    placeholder="הערות על ההזמנה, לדוגמה, הערות מיוחדות למסירה."
                  />
                </div>
              </form>
            </div>
          </section>

          {/* עמודת שמאל – אפשר לשלב כאן “הזמנה שלך” (רשימת פריטים/סיכום) בעתיד */}
          <aside className="hidden lg:block">
            <div className="rounded-xl border border-gray-200 bg-white p-6 text-gray-500">
              {/* השארתי ריק בכוונה כדי להתמקד בבקשה: “פרטי חיוב” והחלק העליון */}
              {/* כאן אפשר להכניס את ההזמנה שלך / סכום ביניים וכו' */}
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}

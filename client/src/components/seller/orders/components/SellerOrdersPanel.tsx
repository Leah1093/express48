import type { FC, FormEvent } from "react";
import { useState } from "react";
import { FiSearch } from "react-icons/fi";
import { useSellerOrders } from "../hooks/useSellerOrders";
import {
  ORDER_STATUS_OPTIONS,
  ORANGE,
} from "../constants/sellerOrders.constants";
import SellerOrdersTable from "./SellerOrdersTable";
import type { SellerOrdersFilter } from "../types/sellerOrders.types";

const SellerOrdersPanel: FC = () => {
  const [status, setStatus] =
    useState<SellerOrdersFilter["status"]>("all");
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");

  const {
    orders,
    isLoading,
    isError,
    refetch,
    changeStatus,
    isUpdatingStatus,
  } = useSellerOrders({
    status,
    search,
  });

  const handleSubmitSearch = (e: FormEvent) => {
    e.preventDefault();
    setSearch(searchInput.trim());
  };

  const handleClearSearch = () => {
    setSearchInput("");
    setSearch("");
  };

  return (
    <section className="w-full" dir="rtl">
      <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:p-6">
        {/* כותרת עליונה */}
        <header className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="space-y-1">
            <h1 className="text-base font-semibold text-slate-900 md:text-lg">
              ההזמנות שלי
            </h1>
            <p className="text-xs text-slate-600 md:text-sm">
              כל ההזמנות המכילות מוצרים מהחנות שלך, כולל סטטוס, כתובת וסכום.
            </p>
          </div>

          {/* חיפוש */}
          <form
            onSubmit={handleSubmitSearch}
            className="flex w-full flex-col gap-2 sm:flex-row sm:items-center sm:justify-end"
          >
            <div className="relative w-full sm:w-72">
              <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-slate-400">
                <FiSearch className="h-4 w-4" />
              </span>
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="חיפוש לפי מספר הזמנה, לקוח או כתובת..."
                className="w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 pr-3 pl-9 text-sm text-slate-900 focus:border-transparent focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-400"
              />
            </div>

            <div className="flex items-center gap-2">
              <button
                type="submit"
                className="rounded-lg px-4 py-2 text-sm font-medium text-white shadow-sm hover:opacity-90 active:opacity-80"
                style={{ backgroundColor: ORANGE }}
              >
                חיפוש
              </button>
              {search && (
                <button
                  type="button"
                  onClick={handleClearSearch}
                  className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-600 hover:bg-slate-50"
                >
                  נקה
                </button>
              )}
            </div>
          </form>
        </header>

        {/* פילטר סטטוס */}
        <div className="flex flex-col gap-2 rounded-xl border border-slate-100 bg-slate-50/80 px-3 py-2 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-slate-600">
              סטטוס הזמנה:
            </span>
            <span className="text-xs text-slate-500">
              לחצי כדי לסנן לפי מצב הטיפול
            </span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {ORDER_STATUS_OPTIONS.map((opt) => {
              const isActive = status === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setStatus(opt.value)}
                  className={`rounded-full border px-3 py-1 text-xs font-medium transition ${
                    isActive
                      ? "bg-white text-slate-900 border-slate-300 shadow-sm"
                      : "bg-transparent text-slate-600 border-transparent hover:bg-white/80 hover:border-slate-200"
                  }`}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* חיווי עדכון סטטוס */}
        {isUpdatingStatus && (
          <div className="text-xs text-orange-600">
            מעדכן סטטוס הזמנה...
          </div>
        )}

        {/* טבלה / כרטיסים */}
        <SellerOrdersTable
          orders={orders}
          isLoading={isLoading}
          isError={isError}
          onRetry={refetch}
          onChangeStatus={changeStatus}
          isUpdatingStatus={isUpdatingStatus}
        />
      </div>
    </section>
  );
};

export default SellerOrdersPanel;

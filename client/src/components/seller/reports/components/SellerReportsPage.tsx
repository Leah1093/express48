import type { FC } from "react";
import { useState } from "react";
import { useGetSellerProductReportsQuery } from "../../../../redux/services/sellerReportsApi";
import { SellerReportsTable } from "./SellerReportsTable";

const DEFAULT_LIMIT = 20;

export const SellerReportsPage: FC = () => {
  const [page, setPage] = useState(1);
  const limit = DEFAULT_LIMIT;

  const [from, setFrom] = useState<string>("");
  const [to, setTo] = useState<string>("");

  const { data, isLoading, isError, isFetching } =
    useGetSellerProductReportsQuery({
      page,
      limit,
      from: from || undefined,
      to: to || undefined,
    });

  const items = data?.items ?? [];
  const total = data?.meta?.total ?? 0;

  const handleClearFilters = () => {
    setFrom("");
    setTo("");
    setPage(1);
  };

  return (
    <div className="w-full flex flex-col gap-4" dir="rtl">
      <h1 className="text-2xl font-semibold">דוחות מכירות לפי מוצר</h1>

      <div className="flex flex-wrap items-end gap-3 bg-white p-3 rounded border">
        <div className="flex flex-col">
          <label className="text-xs text-gray-600 mb-1">מתאריך</label>
          <input
            type="date"
            value={from}
            onChange={(e) => {
              setFrom(e.target.value);
              setPage(1);
            }}
            className="border rounded px-2 py-1 text-sm"
          />
        </div>

        <div className="flex flex-col">
          <label className="text-xs text-gray-600 mb-1">עד תאריך</label>
          <input
            type="date"
            value={to}
            onChange={(e) => {
              setTo(e.target.value);
              setPage(1);
            }}
            className="border rounded px-2 py-1 text-sm"
          />
        </div>

        <button
          type="button"
          onClick={handleClearFilters}
          className="px-3 py-1 border rounded text-sm"
        >
          איפוס תאריכים
        </button>

        {isFetching && (
          <span className="text-xs text-gray-500">טוען נתונים...</span>
        )}
      </div>

      {isError && (
        <div className="text-red-600 text-sm">
          אירעה שגיאה בטעינת הדוח. נסי שוב מאוחר יותר.
        </div>
      )}

      <SellerReportsTable
        items={items}
        isLoading={isLoading}
        page={page}
        limit={limit}
        total={total}
        onPageChange={setPage}
        from={from || undefined}
        to={to || undefined}
      />
    </div>
  );
};

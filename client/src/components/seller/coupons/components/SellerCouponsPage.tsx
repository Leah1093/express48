import React, { useState, type FC } from "react";
import {
  useGetCouponsQuery,
  useDeleteCouponMutation,
} from "../../../../redux/services/couponApi";
import { CouponForm, type CouponDto } from "./CouponForm";
import { CouponsTable } from "./CouponsTable";

// ✅ טיפוס מסודר למה שההוק מחזיר לנו
type CouponsQueryResult = {
  data?: CouponDto[];
  isLoading: boolean;
  isError: boolean;
};

// ✅ עוטפים את ההוק שמגיע מ־JS בפונקציה מטופסת
const useGetCouponsSafe: () => CouponsQueryResult =
  useGetCouponsQuery as unknown as () => CouponsQueryResult;

export const SellerCouponsPage: FC = () => {
  // ⬅️ עכשיו קוראים להוק המטופס, ואין אדום על הקריאה
  const { data, isLoading, isError } = useGetCouponsSafe();

  const coupons: CouponDto[] = data ?? [];

  const [deleteCoupon, { isLoading: isDeleting }] =
    useDeleteCouponMutation() as any;

  const [editingCoupon, setEditingCoupon] = useState<CouponDto | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  const openCreate = () => {
    setEditingCoupon(null);
    setIsFormOpen(true);
  };

  const openEdit = (coupon: CouponDto) => {
    setEditingCoupon(coupon);
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setEditingCoupon(null);
  };

  const handleDelete = async (coupon: CouponDto) => {
    if (!window.confirm(`למחוק את הקופון "${coupon.code}"?`)) return;
    try {
      await deleteCoupon(coupon._id).unwrap();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="flex w-full flex-col gap-6 p-4 sm:p-6" dir="rtl">
      {/* כותרת + כפתור הוספה */}
      <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-lg font-semibold text-slate-900">
            קופונים של המוכר
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            יצירה, עריכה ומחיקה של קופוני הנחה להזמנות בחנות שלך.
          </p>
        </div>

        <button
          type="button"
          onClick={openCreate}
          className="rounded-lg bg-orange-500 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-orange-600"
        >
          קופון חדש
        </button>
      </div>

      {/* טבלה על כל הרוחב */}
      <section className="min-w-0">
        {isLoading ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-500">
            טוען קופונים...
          </div>
        ) : isError ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
            לא ניתן לטעון את רשימת הקופונים.
          </div>
        ) : (
          <CouponsTable
            coupons={coupons}
            onEdit={openEdit}
            onDelete={handleDelete}
          />
        )}

        {isDeleting && (
          <p className="mt-2 text-xs text-slate-400">מוחק קופון...</p>
        )}
      </section>

      {/* פופאפ לטופס יצירה / עריכה */}
      {isFormOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-3xl">
            <div className="relative max-h-[90vh] overflow-y-auto rounded-2xl bg-white p-4 sm:p-6 shadow-lg">
              {/* כפתור X לסגירה */}
              <button
                type="button"
                onClick={closeForm}
                className="absolute left-4 top-3 text-xl leading-none text-slate-400 hover:text-slate-700"
                aria-label="סגירת טופס"
              >
                ×
              </button>

              <CouponForm
                editingCoupon={editingCoupon}
                onDone={closeForm}
                onCancel={closeForm}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

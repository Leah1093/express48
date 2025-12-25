import { useState } from "react";
import type { CouponDto } from "../types/coupon.types";

export const useSellerCouponsState = () => {
  const [editingCoupon, setEditingCoupon] = useState<CouponDto | null>(null);

  const startCreate = () => setEditingCoupon(null);
  const startEdit = (coupon: CouponDto) => setEditingCoupon(coupon);

  return {
    editingCoupon,
    startCreate,
    startEdit,
  };
};

import type { CouponFormValues, DiscountType, RestrictionType } from "../types/coupon.types";

export const DEFAULT_COUPON_FORM: CouponFormValues = {
  code: "",
  discountType: "percent",
  discountValue: 0,
  expiryDate: "",
  usageLimit: null,
  usagePerUser: false,
  minOrderAmount: 0,
  restrictionType: "none",
};

export const DISCOUNT_TYPE_LABELS: Record<DiscountType, string> = {
  percent: "אחוז",
  fixed: "סכום קבוע",
};

export const RESTRICTION_TYPE_LABELS: Record<RestrictionType, string> = {
 none: "ללא הגבלה (קופון רגיל)",
  specificUsers: "לקוחות ספציפיים",
  specificProducts: "מוצרים ספציפיים",
  specificUsersAndProducts: "לקוחות ומוצרים ספציפיים",
};

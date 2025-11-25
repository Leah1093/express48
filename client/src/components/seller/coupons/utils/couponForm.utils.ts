import type { CouponDto, CouponFormValues } from "../types/coupon.types";

const toNumber = (v: unknown, def = 0): number => {
  const n = Number(v);
  return Number.isNaN(n) ? def : n;
};

const toNullOrNumber = (v: unknown): number | null => {
  if (v === "" || v === null || typeof v === "undefined") return null;
  const n = Number(v);
  return Number.isNaN(n) ? null : n;
};

export const normalizeCouponPayload = (form: CouponFormValues) => ({
  code: String(form.code || "").trim(),
  discountType: form.discountType,
  discountValue: toNumber(form.discountValue, 0),
  expiryDate: form.expiryDate,
  usageLimit: toNullOrNumber(form.usageLimit),
  usagePerUser: !!form.usagePerUser,
  minOrderAmount: toNumber(form.minOrderAmount, 0),
  restrictionType: form.restrictionType,
});

export const couponToFormValues = (coupon: CouponDto): CouponFormValues => ({
  code: coupon.code,
  discountType: coupon.discountType,
  discountValue: coupon.discountValue,
  expiryDate: coupon.expiryDate.slice(0, 10),
  usageLimit: coupon.usageLimit ?? null,
  usagePerUser: coupon.usagePerUser,
  minOrderAmount: coupon.minOrderAmount,
  restrictionType: coupon.restrictionType,
});

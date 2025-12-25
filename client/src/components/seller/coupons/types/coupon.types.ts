
export type DiscountType = "percent" | "fixed";
export type RestrictionType = | "none"
  | "specificUsers"
  | "specificProducts"
  | "specificUsersAndProducts";


// חייב לשקף את מבנה ה־Coupon מהבקאנד
export interface CouponDto {
  _id: string;
  code: string;
  discountType: DiscountType;
  discountValue: number;
  expiryDate: string;      // ISO string
  usageLimit: number | null;
  usagePerUser: boolean;
  minOrderAmount: number;
  restrictionType: RestrictionType;
  allowedSellers?: string[];
  allowedProducts?: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface CouponFormValues {
  code: string;
  discountType: DiscountType;
  discountValue: number | "";
  expiryDate: string;
  usageLimit: number | "" | null;
  usagePerUser: boolean;
  minOrderAmount: number | "";
  restrictionType: RestrictionType;
}

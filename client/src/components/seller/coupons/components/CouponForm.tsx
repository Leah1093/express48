import React, {
  useEffect,
  useState,
  type FC,
  type FormEvent,
  type ChangeEvent,
} from "react";
import {
  useCreateCouponMutation,
  useUpdateCouponMutation,
} from "../../../../redux/services/couponApi";
import { useListUsersQuery } from "../../../../redux/services/userApi";
import { useListSellerProductsQuery } from "../../../../redux/services/sellerProductsApi";

// טיפוסים מקומיים
export type DiscountType = "percent" | "fixed";

// הוספתי specificProducts
export type RestrictionType =
  | "none"
  | "specificUsers"
  | "specificProducts"
  | "specificUsersAndProducts";

export interface CouponDto {
  _id: string;
  code: string;
  discountType: DiscountType;
  discountValue: number;
  expiryDate: string;
  usageLimit: number | null;
  usagePerUser: boolean;
  minOrderAmount: number;
  restrictionType: RestrictionType;

  // שדות חדשים להגבלות
  allowedUsers?: any[];
  allowedProducts?: any[];
  allowedSellers?: any[];
}

// ערכי טופס
export interface CouponFormValues {
  code: string;
  discountType: DiscountType;
  discountValue: number | "";
  expiryDate: string;
  usageLimit: number | "" | null;
  usagePerUser: boolean;
  minOrderAmount: number | "";
  restrictionType: RestrictionType;

  allowedUsers: string[];
  allowedProducts: string[];
  allowedSellers: string[];
}

// ברירת מחדל לטופס
const DEFAULT_COUPON_FORM: CouponFormValues = {
  code: "",
  discountType: "percent",
  discountValue: 0,
  expiryDate: "",
  usageLimit: null,
  usagePerUser: false,
  minOrderAmount: 0,
  restrictionType: "none",
  allowedUsers: [],
  allowedProducts: [],
  allowedSellers: [],
};

// טקסטים
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

// עזר להמרות
const toNumber = (v: unknown, def = 0): number => {
  const n = Number(v);
  return Number.isNaN(n) ? def : n;
};

const toNullOrNumber = (v: unknown): number | null => {
  if (v === "" || v === null || typeof v === "undefined") return null;
  const n = Number(v);
  return Number.isNaN(n) ? null : n;
};

const normalizeCouponPayload = (form: CouponFormValues) => ({
  code: String(form.code || "").trim(),
  discountType: form.discountType,
  discountValue: toNumber(form.discountValue, 0),
  expiryDate: form.expiryDate,
  usageLimit: toNullOrNumber(form.usageLimit),
  usagePerUser: !!form.usagePerUser,
  minOrderAmount: toNumber(form.minOrderAmount, 0),
  restrictionType: form.restrictionType,
  allowedUsers: form.allowedUsers,
  allowedProducts: form.allowedProducts,
  allowedSellers: form.allowedSellers,
});
const normalizeIdArray = (value: any): string[] => {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => {
      if (!item) return null;
      if (typeof item === "string") return item;
      if (typeof item === "object" && item._id) return String(item._id);
      return null;
    })
    .filter((id): id is string => !!id);
};

const couponToFormValues = (coupon: CouponDto): CouponFormValues => ({
  code: coupon.code,
  discountType: coupon.discountType,
  discountValue: coupon.discountValue,
  expiryDate: coupon.expiryDate.slice(0, 10), // yyyy-mm-dd
  usageLimit: coupon.usageLimit ?? null,
  usagePerUser: coupon.usagePerUser,
  minOrderAmount: coupon.minOrderAmount,
  restrictionType: coupon.restrictionType,
  allowedUsers: normalizeIdArray((coupon as any).allowedUsers),
  allowedProducts: normalizeIdArray((coupon as any).allowedProducts),
  allowedSellers: normalizeIdArray((coupon as any).allowedSellers),
});

type Props = {
  editingCoupon: CouponDto | null;
  onDone: () => void;
  onCancel?: () => void;
};

// טיפוסים פשוטים לרשימות
type SimpleUser = {
  _id: string;
  email?: string;
  username?: string;
};

type SimpleProduct = {
  _id: string;
  title?: string;
  sku?: string;
  brand?: string;
};

export const CouponForm: FC<Props> = ({ editingCoupon, onDone, onCancel }) => {
  const [form, setForm] = useState<CouponFormValues>(DEFAULT_COUPON_FORM);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // בגלל שה־service ב־JS, נעשה cast ל־any
  const [createCoupon, { isLoading: isCreating }] =
    useCreateCouponMutation() as any;
  const [updateCoupon, { isLoading: isUpdating }] =
    useUpdateCouponMutation() as any;

  const isEditMode = !!editingCoupon;
  const isSubmitting = isCreating || isUpdating;

  // 🔹 שליפת רשימת לקוחות
  const {
    data: usersRaw,
    isLoading: isUsersLoading,
    isError: isUsersError,
  } = useListUsersQuery(undefined as any);

  // תמיכה גם במבנה data = [] וגם data = { items: [] }
  const users: SimpleUser[] = (() => {
    const anyData = usersRaw as any;
    if (Array.isArray(anyData)) return anyData as SimpleUser[];
    if (Array.isArray(anyData?.items)) return anyData.items as SimpleUser[];
    return [];
  })();

  // 🔹 שליפת רשימת מוצרים של המוכר
  const {
    data: productsRaw,
    isLoading: isProductsLoading,
    isError: isProductsError,
  } = useListSellerProductsQuery({
    page: 1,
    limit: 100,
    deleted: "active",
    sort: "-updatedAt",
    fields: "_id,title,sku,brand",
  } as any);

  const products: SimpleProduct[] = (() => {
    const anyData = productsRaw as any;
    if (Array.isArray(anyData)) return anyData as SimpleProduct[];
    if (Array.isArray(anyData?.items)) return anyData.items as SimpleProduct[];
    return [];
  })();

  useEffect(() => {
    if (editingCoupon) {
      setForm(couponToFormValues(editingCoupon));
      setMessage(null);
    } else {
      setForm(DEFAULT_COUPON_FORM);
      setMessage(null);
    }
  }, [editingCoupon]);

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const target = e.target;
    const { name, value } = target;

    // checkbox
    if (target instanceof HTMLInputElement && target.type === "checkbox") {
      setForm((prev) => ({
        ...prev,
        [name]: target.checked,
      }));
      return;
    }

    // מספרים
    if (name === "discountValue" || name === "minOrderAmount") {
      setForm((prev) => ({
        ...prev,
        [name]: value === "" ? "" : Number(value),
      }));
      return;
    }

    if (name === "usageLimit") {
      setForm((prev) => ({
        ...prev,
        [name]: value === "" ? "" : Number(value),
      }));
      return;
    }

    // כל השאר
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateForm = (): string | null => {
    if (!form.code.trim()) return "יש למלא קוד קופון";
    if (!form.expiryDate) return "יש לבחור תאריך תפוגה";
    if (!form.discountValue || Number(form.discountValue) <= 0) {
      return "ערך ההנחה חייב להיות גדול מ־0";
    }

    if (
      (form.restrictionType === "specificUsers" ||
        form.restrictionType === "specificUsersAndProducts") &&
      form.allowedUsers.length === 0
    ) {
      return "בחרי לפחות לקוח אחד לקופון";
    }

    // מוצרים ספציפיים (גם במצב המשולב)
    if (
      (form.restrictionType === "specificProducts" ||
        form.restrictionType === "specificUsersAndProducts") &&
      form.allowedProducts.length === 0
    ) {
      return "בחרי לפחות מוצר אחד לקופון";
    }

    return null;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setMessage(null);

    const errorMsg = validateForm();
    if (errorMsg) {
      setMessage({ type: "error", text: errorMsg });
      return;
    }

    const payload = normalizeCouponPayload(form);

    try {
      if (isEditMode && editingCoupon) {
        await updateCoupon({ id: editingCoupon._id, data: payload }).unwrap();
        setMessage({ type: "success", text: "הקופון עודכן בהצלחה" });
      } else {
        await createCoupon(payload).unwrap();
        setMessage({ type: "success", text: "הקופון נוצר בהצלחה" });
        setForm(DEFAULT_COUPON_FORM);
      }

      onDone();
    } catch (err: any) {
      const serverMsg =
        err?.data?.error || err?.error || "אירעה שגיאה בשמירת הקופון";
      setMessage({ type: "error", text: serverMsg });
    }
  };

  // 🔹 בחירה מרובה של לקוחות
  const toggleUser = (id: string) => {
    setForm((prev) => ({
      ...prev,
      allowedUsers: prev.allowedUsers.includes(id)
        ? prev.allowedUsers.filter((x) => x !== id)
        : [...prev.allowedUsers, id],
    }));
  };

  // 🔹 בחירה מרובה של מוצרים
  const toggleProduct = (id: string) => {
    setForm((prev) => ({
      ...prev,
      allowedProducts: prev.allowedProducts.includes(id)
        ? prev.allowedProducts.filter((x) => x !== id)
        : [...prev.allowedProducts, id],
    }));
  };

  const selectAllUsers = () => {
    setForm((prev) => ({
      ...prev,
      allowedUsers: users.map((u) => u._id),
    }));
  };

  const clearUsers = () => {
    setForm((prev) => ({
      ...prev,
      allowedUsers: [],
    }));
  };

  const selectAllProducts = () => {
    setForm((prev) => ({
      ...prev,
      allowedProducts: products.map((p) => p._id),
    }));
  };

  const clearProducts = () => {
    setForm((prev) => ({
      ...prev,
      allowedProducts: [],
    }));
  };

  return (
    <div className="w-full max-w-xl rounded-2xl border border-slate-200 bg-white p-4 sm:p-6 shadow-sm">
      <h2 className="mb-4 text-right text-lg font-semibold text-slate-900">
        {isEditMode ? "עריכת קופון" : "יצירת קופון חדש"}
      </h2>

      {message && (
        <div
          className={`mb-4 rounded-md border px-3 py-2 text-sm text-right ${
            message.type === "error"
              ? "border-red-300 bg-red-50 text-red-700"
              : "border-emerald-300 bg-emerald-50 text-emerald-700"
          }`}
        >
          {message.text}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 gap-4"
        dir="rtl"
      >
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-800">
            קוד קופון
          </label>
          <input
            type="text"
            name="code"
            value={form.code}
            onChange={handleChange}
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-300"
            required
            dir="ltr"
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-800">
              סוג הנחה
            </label>
            <select
              name="discountType"
              value={form.discountType}
              onChange={handleChange}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-300"
            >
              <option value="percent">{DISCOUNT_TYPE_LABELS.percent}</option>
              <option value="fixed">{DISCOUNT_TYPE_LABELS.fixed}</option>
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-800">
              ערך הנחה
            </label>
            <input
              type="number"
              name="discountValue"
              value={form.discountValue}
              onChange={handleChange}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-300"
              min={0}
              step="0.01"
            />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-800">
              תאריך תפוגה
            </label>
            <input
              type="date"
              name="expiryDate"
              value={form.expiryDate}
              onChange={handleChange}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-300"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-800">
              מספר שימושים מרבי (לכלל הלקוחות)
            </label>
            <input
              type="number"
              name="usageLimit"
              value={form.usageLimit === null ? "" : form.usageLimit}
              onChange={handleChange}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-300"
              min={0}
              placeholder="השאירו ריק = ללא הגבלה"
            />
          </div>
        </div>

        <div className="flex items-center justify-start gap-2">
          <input
            id="usagePerUser"
            type="checkbox"
            name="usagePerUser"
            checked={!!form.usagePerUser}
            onChange={handleChange}
            className="h-4 w-4 rounded border-slate-300 text-orange-500 focus:ring-orange-400"
          />
          <label htmlFor="usagePerUser" className="text-sm text-slate-700">
            שימוש חד פעמי לכל לקוח
          </label>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-800">
            סכום מינימלי להזמנה
          </label>
          <input
            type="number"
            name="minOrderAmount"
            value={form.minOrderAmount}
            onChange={handleChange}
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-300"
            min={0}
            step="0.01"
          />
        </div>

        {/* סוג הגבלת קופון */}
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-800">
            הגבלת קופון
          </label>
          <select
            name="restrictionType"
            value={form.restrictionType}
            onChange={handleChange}
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-300"
          >
            {Object.entries(RESTRICTION_TYPE_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>

        {/* 🔹 בחירת לקוחות ספציפיים */}
        {(form.restrictionType === "specificUsers" ||
          form.restrictionType === "specificUsersAndProducts") && (
          <div>
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm font-medium text-slate-800">
                לקוחות שהקופון תקף עבורם
              </span>
              <div className="flex gap-2 text-xs">
                <button
                  type="button"
                  onClick={selectAllUsers}
                  className="rounded border border-slate-300 px-2 py-1 text-slate-700 hover:bg-slate-50"
                >
                  בחרי הכל
                </button>
                <button
                  type="button"
                  onClick={clearUsers}
                  className="rounded border border-slate-300 px-2 py-1 text-slate-500 hover:bg-slate-50"
                >
                  נקה הכל
                </button>
              </div>
            </div>

            <div className="max-h-60 overflow-y-auto rounded-xl border border-slate-200 bg-slate-50 p-2">
              {isUsersLoading && (
                <div className="px-2 py-1 text-xs text-slate-500">
                  טוען לקוחות...
                </div>
              )}
              {isUsersError && (
                <div className="px-2 py-1 text-xs text-red-600">
                  שגיאה בטעינת רשימת הלקוחות
                </div>
              )}
              {!isUsersLoading && !users.length && !isUsersError && (
                <div className="px-2 py-1 text-xs text-slate-500">
                  אין לקוחות להצגה.
                </div>
              )}

              {users.map((user) => {
                console.log("USER OPTION", user);
                const isChecked = form.allowedUsers.includes(user._id);
                const labelName = user.username || "";
                const label =
                  labelName && user.email
                    ? `${labelName} (${user.email})`
                    : user.email || labelName || user._id;

                return (
                  <label
                    key={user._id}
                    className="flex cursor-pointer items-center justify-between gap-2 rounded-lg px-2 py-1.5 hover:bg-slate-100"
                  >
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => toggleUser(user._id)}
                        className="h-4 w-4 rounded border-slate-300 text-orange-500 focus:ring-orange-400"
                      />
                      <span className="text-xs text-slate-800">{label}</span>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>
        )}

        {/* 🔹 בחירת מוצרים ספציפיים */}
        {(form.restrictionType === "specificProducts" ||
          form.restrictionType === "specificUsersAndProducts") && (
          <div>
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm font-medium text-slate-800">
                מוצרים שהקופון תקף עליהם
              </span>
              <div className="flex gap-2 text-xs">
                <button
                  type="button"
                  onClick={selectAllProducts}
                  className="rounded border border-slate-300 px-2 py-1 text-slate-700 hover:bg-slate-50"
                >
                  בחרי הכל
                </button>
                <button
                  type="button"
                  onClick={clearProducts}
                  className="rounded border border-slate-300 px-2 py-1 text-slate-500 hover:bg-slate-50"
                >
                  נקה הכל
                </button>
              </div>
            </div>

            <div className="max-h-60 overflow-y-auto rounded-xl border border-slate-200 bg-slate-50 p-2">
              {isProductsLoading && (
                <div className="px-2 py-1 text-xs text-slate-500">
                  טוען מוצרים...
                </div>
              )}
              {isProductsError && (
                <div className="px-2 py-1 text-xs text-red-600">
                  שגיאה בטעינת רשימת המוצרים
                </div>
              )}
              {!isProductsLoading && !products.length && !isProductsError && (
                <div className="px-2 py-1 text-xs text-slate-500">
                  אין מוצרים להצגה.
                </div>
              )}

              {products.map((product) => {
                const isChecked = form.allowedProducts.includes(product._id);
                const labelParts = [
                  product.title,
                  product.sku ? `SKU: ${product.sku}` : "",
                  product.brand ? `(${product.brand})` : "",
                ].filter(Boolean);
                const label =
                  labelParts.length > 0 ? labelParts.join(" ") : product._id;

                return (
                  <label
                    key={product._id}
                    className="flex cursor-pointer items-center justify-between gap-2 rounded-lg px-2 py-1.5 hover:bg-slate-100"
                  >
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => toggleProduct(product._id)}
                        className="h-4 w-4 rounded border-slate-300 text-orange-500 focus:ring-orange-400"
                      />
                      <span className="text-xs text-slate-800">{label}</span>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>
        )}

        <div className="mt-2 flex justify-start gap-3">
          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-lg bg-orange-500 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting
              ? "שומר..."
              : isEditMode
              ? "עדכון קופון"
              : "יצירת קופון"}
          </button>

          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              ביטול
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

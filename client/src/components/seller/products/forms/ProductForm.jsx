// import { useMemo, useState, useEffect } from "react";
// import { useForm, FormProvider } from "react-hook-form";
// // import { zodResolver } from "@hookform/resolvers/zod";

// import ProductGeneralSection from "./ProductGeneralSection";
// import ProductDescriptionSection from "./ProductDescriptionSection";
// import ProductOverviewSection from "./ProductOverviewSection";
// import ProductSpecsSection from "./ProductSpecsSection";
// import ProductMediaSection from "./ProductMediaSection";
// import ProductShippingSection from "./ProductShippingSection";
// import ProductInventorySection from "./ProductInventorySection";
// import ProductPricingSection from "./ProductPricingSection";
// import ProductSeoSection from "./ProductSeoSection";
// import ProductVisibilitySection from "./ProductVisibilitySection";
// import ProductAdminSection from "./ProductAdminSection";
// import ProductVariationsSection from "./ProductVariationsSection";
// import axios from "axios";

// // import { z } from "zod";
// // import { productShippingSchema } from "../schemas/productShippingSchema";
// // import { productInventorySchema } from "../schemas/productInventorySchema";
// // import { productPricingSchema } from "../schemas/productPricingSchema";
// // import { productSeoSchema } from "../schemas/productSeoSchema";
// // import { productVisibilitySchema } from "../schemas/productVisibilitySchema";
// // import { productVariationsSchema } from "../schemas/productVariationsSchema";

// // utils
// function toISOorNull(s) {
//     if (!s) return null;
//     const d = new Date(s);
//     return Number.isNaN(d.valueOf()) ? null : d.toISOString();
// }

// function pairsToMap(pairs = []) {
//     const obj = {};
//     for (const { key, value } of pairs) {
//         const k = (key || "").trim();
//         if (k) obj[k] = (value || "").trim();
//     }
//     return obj;
// }

// function clean(obj) {
//     const out = Array.isArray(obj) ? [] : {};
//     const isEmpty = (v) =>
//         v === "" ||
//         v === undefined ||
//         v === null ||
//         (Array.isArray(v) && v.length === 0) ||
//         (typeof v === "object" && v !== null && Object.keys(v).length === 0);

//     for (const [k, v] of Object.entries(obj || {})) {
//         if (v && typeof v === "object" && !Array.isArray(v)) {
//             const nested = clean(v);
//             if (!isEmpty(nested)) out[k] = nested;
//         } else if (!isEmpty(v)) {
//             out[k] = v;
//         }
//     }
//     return out;
// }

// // base + merge
// // const productBaseSchema = z.object({
// //   title: z.string({ required_error: "שם מוצר חובה" }).trim().min(2, "שם קצר מדי"),
// //   titleEn: z.string().trim().optional().default(""),
// //   brand: z.string().trim().optional().default(""),
// //   category: z.string().trim().default("אחר"),
// //   subCategory: z.string().trim().optional().default(""),
// //   warranty: z.string().trim().default("12 חודשים אחריות יבואן רשמי"),

// //   description: z.string().optional().default(""),
// //   overview: z.object({
// //     text: z.string().optional().default(""),
// //     images: z.array(z.string()).default([]),
// //     videos: z.array(z.string()).default([]),
// //   }),

// //   specsPairs: z
// //     .array(
// //       z.object({
// //         key: z.string().optional().default(""),
// //         value: z.string().optional().default(""),
// //       })
// //     )
// //     .default([]),

// //   images: z.array(z.string()).default([]),
// //   video: z.string().optional().default(""),

// //   status: z.enum(["טיוטא", "מפורסם", "מושהה"]).default("טיוטא"),
// //   sku: z.string().optional().default(""),
// //   sellerSku: z.string().optional().default(""),
// //   model: z.string().optional().default(""),
// //   supplier: z.string().optional().default(""),
// // });

// // const masterSchema = productBaseSchema
// //   .merge(productShippingSchema)
// //   .merge(productInventorySchema)
// //   .merge(productPricingSchema)
// //   .merge(productSeoSchema)
// //   .merge(productVisibilitySchema)
// //   .merge(productVariationsSchema);

// const defaultValuesMaster = {
//     title: "",
//     titleEn: "",
//     brand: "",
//     category: "אחר",
//     subCategory: "",
//     warranty: "12 חודשים אחריות יבואן רשמי",

//     description: "",
//     overview: { text: "", images: [], videos: [] },

//     specsPairs: [],

//     images: [],
//     video: "",

//     shipping: {
//         dimensions: { length: 0, width: 0, height: 0 },
//         weight: "",
//         from: "IL",
//     },
//     delivery: {
//         requiresDelivery: false,
//         cost: 0,
//         notes: "",
//     },

//     sku: "",
//     stock: 0,
//     gtin: "",
//     inStock: false,

//     currency: "ILS",
//     price: { amount: 0 },
//     discount: {
//         discountType: "",
//         discountValue: undefined,
//         startsAt: "",
//         expiresAt: "",
//     },

//     slug: "",
//     metaTitle: "",
//     metaDescription: "",

//     visibility: "public",
//     scheduledAt: "",
//     visibleUntil: "",

//     status: "טיוטא",
//     sellerSku: "",
//     model: "",
//     supplier: "",

//     variations: [],

//     variationsConfig: {
//         priceRule: "sum",
//         attributes: [],
//     },
// };

// export default function ProductForm({
//     mode = "create",
//     initialData = null,
//     onSuccess,
//     endpoint = "/seller/products",
// }) {
//     const [serverError, setServerError] = useState(null);
//     const [submitting, setSubmitting] = useState(false);

//     const defaults = useMemo(() => {
//         if (!initialData) return defaultValuesMaster;
//         return {
//             ...defaultValuesMaster,
//             ...initialData,

//             overview: { ...defaultValuesMaster.overview, ...initialData.overview },
//             shipping: { ...defaultValuesMaster.shipping, ...initialData.shipping },
//             delivery: { ...defaultValuesMaster.delivery, ...initialData.delivery },
//             price: { ...defaultValuesMaster.price, ...initialData.price },
//             discount: { ...defaultValuesMaster.discount, ...initialData.discount },

//             variations: initialData.variations || [],

//             variationsConfig: { priceRule: "sum", attributes: [] },
//         };
//     }, [initialData]);
//     // בדיקת בריאות לכל חלקי הסכימה לפני ה-resolver:
//     // const parts = {
//     // //   base: productBaseSchema,
//     //   shipping: productShippingSchema,
//     //   inventory: productInventorySchema,
//     //   pricing: productPricingSchema,
//     //   seo: productSeoSchema,
//     //   visibility: productVisibilitySchema,
//     //   variations: productVariationsSchema,
//     // };

//     // for (const [k, v] of Object.entries(parts)) {
//     //   console.log(`[schema-check] ${k}:`, typeof v?.parse === "function" ? "OK" : v);
//     // }

//     // console.assert(typeof productVariationsSchema?.parse === "function", "❌ productVariationsSchema לא טעונה");
//     // console.assert(typeof productShippingSchema?.parse === "function", "❌ productShippingSchema לא טעונה");
//     // console.assert(typeof productInventorySchema?.parse === "function", "❌ productInventorySchema לא טעונה");
//     // console.assert(typeof productPricingSchema?.parse === "function", "❌ productPricingSchema לא טעונה");
//     // console.assert(typeof productSeoSchema?.parse === "function", "❌ productSeoSchema לא טעונה");
//     // console.assert(typeof productVisibilitySchema?.parse === "function", "❌ productVisibilitySchema לא טעונה");

//     const methods = useForm({
//         // resolver: zodResolver(masterSchema),
//         defaultValues: defaults,
//         mode: "onSubmit",
//         shouldUnregister: false,
//     });

//     const { errors, isSubmitting, isValidating } = methods.formState;

//     useEffect(() => {
//         if (Object.keys(errors).length) {
//             console.log("🪵 formState.errors (FULL):", errors);
//             const flatten = (obj, prefix = "") =>
//                 Object.entries(obj).flatMap(([k, v]) => {
//                     const path = prefix ? `${prefix}.${k}` : k;
//                     if (v?.types || v?.message) return [path + (v.message ? ` -> ${v.message}` : "")];
//                     if (typeof v === "object" && v) return flatten(v, path);
//                     return [];
//                 });
//             console.log("🧭 flat error paths:", flatten(errors));
//         }
//     }, [errors]);

//     useEffect(() => {
//         console.log("⏳ isValidating:", isValidating, " | 🚀 isSubmitting:", isSubmitting);
//     }, [isValidating, isSubmitting]);

//     const onSubmit = async (values) => {
//         setServerError(null);
//         setSubmitting(true);

//         try {
//             const payload = { ...values };
//             console.log("payload1", payload);

//             payload.specs = pairsToMap(values.specsPairs);
//             delete payload.specsPairs;
//             console.log("payload2", payload);

//             payload.discount = payload.discount || {};
//             payload.discount.startsAt = toISOorNull(values.discount?.startsAt || "");
//             payload.discount.expiresAt = toISOorNull(values.discount?.expiresAt || "");
//             // 2.1) אם אין באמת הנחה, לא שולחים את האובייקט בכלל
//             const hasDiscountType =
//                 payload.discount && typeof payload.discount.discountType === "string" && payload.discount.discountType.trim() !== "";
//             const hasDiscountValue =
//                 payload.discount && typeof payload.discount.discountValue === "number" && !Number.isNaN(payload.discount.discountValue);
//             if (!hasDiscountType || !hasDiscountValue) {
//                 delete payload.discount;
//             }

//             payload.scheduledAt = toISOorNull(values.scheduledAt || "");
//             payload.visibleUntil = toISOorNull(values.visibleUntil || "");

//             payload.variations = (values.variations || []).map((v) => ({
//                 ...v,
//                 discount: v.discount
//                     ? {
//                         ...v.discount,
//                         startsAt: toISOorNull(v.discount.startsAt || ""),
//                         expiresAt: toISOorNull(v.discount.expiresAt || ""),
//                     }
//                     : undefined,
//                 price:
//                     v?.price && typeof v.price.amount === "number" && !Number.isNaN(v.price.amount)
//                         ? v.price
//                         : undefined,
//             }));

//             const statusMap = { "טיוטא": "draft", "מפורסם": "published", "מושהה": "suspended" };
//             payload.status = statusMap[payload.status] || payload.status;

//             if (!payload.metaTitle || !payload.metaTitle.trim()) {
//                 const parts = [];
//                 if (payload.title) parts.push(payload.title);
//                 const bm = [payload.brand, payload.model].filter(Boolean).join(" ");
//                 if (bm && !String(payload.title || "").includes(bm)) parts.push(bm);
//                 parts.push("משלוח מהיר 48 שעות", "EXPRESS48");
//                 payload.metaTitle = parts.filter(Boolean).join(" - ").slice(0, 60);
//             }

//             delete payload.variationsConfig;

//             const cleaned = clean(payload);
//             console.log("cleaned", cleaned);

//             const url = mode === "edit" && initialData?._id ? `${endpoint}/${initialData._id}` : endpoint;
//             const method = mode === "edit" ? "PATCH" : "POST";
//             const data = await axios.post("https://api.express48.com/seller/products", cleaned, {
//                 withCredentials: true,
//             });
//             // const res = await fetch(url, {
//             //     method,
//             //     headers: { "Content-Type": "application/json" },
//             //     body: JSON.stringify(cleaned),
//             // });

//             // if (!res.ok) {
//             //     const text = await res.text().catch(() => "");
//             //     throw new Error(text || `HTTP ${res.status}`);
//             // }

//             // const data = await res.json();
//             onSuccess?.(data);
//         } catch (err) {
//             setServerError(err?.message || "שגיאת שרת לא ידועה");
//         } finally {
//             setSubmitting(false);
//         }
//     };

//     return (
//         <FormProvider {...methods}>
//             <form noValidate
//                 dir="rtl"
//                 className="space-y-6"
//                 onSubmit={methods.handleSubmit(
//                     onSubmit,
//                     //   (errs) => {
//                     //     console.log("❌ RHF errors:", errs);
//                     //     const paths = Object.entries(errs).map(
//                     //       ([k, v]) => k + (v?.message ? `: ${v.message}` : "")
//                     //     );
//                     //     console.warn("❌ Error fields:", paths);
//                     //     alert("יש שגיאות ולידציה. בדקי קונסול לפירוט.");
//                     //   }
//                 )}
//             >
//                 <header className="flex items-center justify-between">
//                     <h1 className="text-xl font-semibold">
//                         {mode === "edit" ? "עריכת מוצר" : "הוספת מוצר חדש"}
//                     </h1>
//                     <div className="flex gap-2">
//                         <button
//                             type="button"
//                             className="px-4 py-2 rounded-xl border"
//                             onClick={() => methods.reset(defaults)}
//                         >
//                             אפס
//                         </button>
//                         <button
//                             type="submit"
//                             disabled={submitting}
//                             className="px-4 py-2 rounded-xl border bg-blue-600 text-white disabled:opacity-60"
//                         >
//                             {submitting ? "שומר..." : mode === "edit" ? "שמירת שינויים" : "שמירה"}
//                         </button>
//                     </div>
//                 </header>

//                 <ProductGeneralSection />
//                 <ProductDescriptionSection />
//                 <ProductOverviewSection />
//                 <ProductSpecsSection />
//                 <ProductMediaSection />

//                 <ProductPricingSection />
//                 <ProductInventorySection />
//                 <ProductShippingSection />

//                 <ProductSeoSection />
//                 <ProductVisibilitySection />

//                 <ProductAdminSection />
//                 <ProductVariationsSection />

//                 {serverError ? (
//                     <p className="text-red-700 bg-red-50 border border-red-200 rounded-xl p-3">
//                         שגיאה בשמירה: {serverError}
//                     </p>
//                 ) : null}

//                 <div className="flex justify-end gap-2">
//                     <button
//                         type="button"
//                         className="px-4 py-2 rounded-xl border"
//                         onClick={() => methods.reset(defaults)}
//                     >
//                         אפס
//                     </button>
//                     <button
//                         type="submit"
//                         disabled={submitting}
//                         className="px-4 py-2 rounded-xl border bg-blue-600 text-white disabled:opacity-60"
//                     >
//                         {submitting ? "שומר..." : mode === "edit" ? "שמירת שינויים" : "שמירה"}
//                     </button>
//                 </div>
//             </form>
//         </FormProvider>
//     );
// }

// // src/components/product/forms/ProductForm.jsx
// import { useMemo, useState } from "react";
// import { useForm, FormProvider } from "react-hook-form";
// import axios from "axios";

// // הסקשנים הקיימים אצלך
// import ProductGeneralSection from "./ProductGeneralSection";
// import ProductDescriptionSection from "./ProductDescriptionSection";
// import ProductOverviewSection from "./ProductOverviewSection";
// import ProductSpecsSection from "./ProductSpecsSection";
// import ProductMediaSection from "./ProductMediaSection";
// import ProductShippingSection from "./ProductShippingSection";
// import ProductInventorySection from "./ProductInventorySection";
// import ProductPricingSection from "./ProductPricingSection";
// import ProductSeoSection from "./ProductSeoSection";
// import ProductVisibilitySection from "./ProductVisibilitySection";
// import ProductAdminSection from "./ProductAdminSection";
// import ProductVariationsSection from "./ProductVariationsSection";

// // ---------- utils (כמו אצלך) ----------
// function toISOorNull(s) { if (!s) return null; const d = new Date(s); return Number.isNaN(d.valueOf()) ? null : d.toISOString(); }
// function pairsToMap(pairs = []) { const obj = {}; for (const { key, value } of pairs) { const k = (key || "").trim(); if (k) obj[k] = (value || "").trim(); } return obj; }
// function clean(obj) {
//     const out = Array.isArray(obj) ? [] : {}; const isEmpty = (v) => v === "" || v === undefined || v === null || (Array.isArray(v) && v.length === 0) || (typeof v === "object" && v !== null && Object.keys(v).length === 0);
//     for (const [k, v] of Object.entries(obj || {})) { if (v && typeof v === "object" && !Array.isArray(v)) { const nested = clean(v); if (!isEmpty(nested)) out[k] = nested; } else if (!isEmpty(v)) { out[k] = v; } }
//     return out;
// }

// const defaultValuesMaster = {
//     title: "", titleEn: "", brand: "", category: "אחר", subCategory: "", warranty: "12 חודשים אחריות יבואן רשמי",
//     description: "", overview: { text: "", images: [], videos: [] },
//     specsPairs: [], images: [], video: "",
//     shipping: { dimensions: { length: 0, width: 0, height: 0 }, weight: "", from: "IL" },
//     delivery: { requiresDelivery: false, cost: 0, notes: "" },
//     sku: "", stock: 0, gtin: "", inStock: false,
//     currency: "ILS", price: { amount: 0 }, discount: { discountType: "", discountValue: undefined, startsAt: "", expiresAt: "" },
//     slug: "", metaTitle: "", metaDescription: "",
//     visibility: "public", scheduledAt: "", visibleUntil: "",
//     status: "טיוטא", sellerSku: "", model: "", supplier: "",
//     variations: [],
//     variationsConfig: { priceRule: "sum", attributes: [] },
// };

// // ---------- הגדרת התפריט הימני ----------
// const PANELS = [
//     { id: "media", label: "מדיה", icon: "🖼️", Component: ProductMediaSection },
//     { id: "pricing", label: "מחירון", icon: "₪", Component: ProductPricingSection },
//     { id: "inventory", label: "מלאי", icon: "📦", Component: ProductInventorySection },
//     { id: "shipping", label: "משלוח", icon: "🚚", Component: ProductShippingSection },
//     { id: "seo", label: "SEO", icon: "🔎", Component: ProductSeoSection },
//     { id: "visibility", label: "נראות", icon: "👁️", Component: ProductVisibilitySection },
//     { id: "admin", label: "ניהול", icon: "⚙️", Component: ProductAdminSection },
//     { id: "variations", label: "וריאציות", icon: "🧩", Component: ProductVariationsSection },
//     { id: "specs", label: "מפרט טכני", icon: "📑", Component: ProductSpecsSection },
//     { id: "overview", label: "סקירה", icon: "📝", Component: ProductOverviewSection },
//     { id: "description", label: "תיאור", icon: "✒️", Component: ProductDescriptionSection },
// ];

// export default function ProductForm({
//     mode = "create",
//     initialData = null,
//     onSuccess,
//     endpoint = "https://api.express48.com/seller/products", // עדיף יחסי (proxy של Vite)
// }) {
//     const [serverError, setServerError] = useState(null);
//     const [submitting, setSubmitting] = useState(false);
//     const [active, setActive] = useState("media"); // רק אחד פתוח

//     const defaults = useMemo(() => {
//         if (!initialData) return defaultValuesMaster;
//         return {
//             ...defaultValuesMaster,
//             ...initialData,
//             overview: { ...defaultValuesMaster.overview, ...initialData.overview },
//             shipping: { ...defaultValuesMaster.shipping, ...initialData.shipping },
//             delivery: { ...defaultValuesMaster.delivery, ...initialData.delivery },
//             price: { ...defaultValuesMaster.price, ...initialData.price },
//             discount: { ...defaultValuesMaster.discount, ...initialData.discount },
//             variations: initialData.variations || [],
//             variationsConfig: { priceRule: "sum", attributes: [] },
//         };
//     }, [initialData]);

//     const methods = useForm({
//         defaultValues: defaults,
//         mode: "onSubmit",
//         // חשוב: לא לבטל רישום כדי לא לאבד ערכים כשמחליפים פאנל
//         shouldUnregister: false,
//     });

//     const onSubmit = async (values) => {
//         console.log("submit", values)
//         setServerError(null);
//         setSubmitting(true);
//         try {
//             const payload = { ...values };
//             payload.specs = pairsToMap(values.specsPairs); delete payload.specsPairs;

//             payload.discount = payload.discount || {};
//             payload.discount.startsAt = toISOorNull(values.discount?.startsAt || "");
//             payload.discount.expiresAt = toISOorNull(values.discount?.expiresAt || "");
//             const hasType = payload.discount?.discountType?.trim?.();
//             const hasVal = typeof payload.discount?.discountValue === "number" && !Number.isNaN(payload.discount.discountValue);
//             if (!hasType || !hasVal) delete payload.discount;

//             payload.scheduledAt = toISOorNull(values.scheduledAt || "");
//             payload.visibleUntil = toISOorNull(values.visibleUntil || "");

//             payload.variations = (values.variations || []).map((v) => ({
//                 ...v,
//                 discount: v.discount ? {
//                     ...v.discount,
//                     startsAt: toISOorNull(v.discount.startsAt || ""),
//                     expiresAt: toISOorNull(v.discount.expiresAt || ""),
//                 } : undefined,
//                 price: (v?.price && typeof v.price.amount === "number" && !Number.isNaN(v.price.amount)) ? v.price : undefined,
//             }));

//             const statusMap = { "טיוטא": "draft", "מפורסם": "published", "מושהה": "suspended" };
//             payload.status = statusMap[payload.status] || payload.status;

//             if (!payload.metaTitle?.trim()) {
//                 const parts = [];
//                 if (payload.title) parts.push(payload.title);
//                 const bm = [payload.brand, payload.model].filter(Boolean).join(" ");
//                 if (bm && !String(payload.title || "").includes(bm)) parts.push(bm);
//                 parts.push("משלוח מהיר 48 שעות", "EXPRESS48");
//                 payload.metaTitle = parts.filter(Boolean).join(" - ").slice(0, 60);
//             }

//             delete payload.variationsConfig;

//             const cleaned = clean(payload);
//             const url = (mode === "edit" && initialData?._id)
//                 ? `https://api.express48.com/seller/products/${initialData._id}`
//                 : `https://api.express48.com/seller/products`;
//             const method = mode === "edit" ? "PATCH" : "POST";
//             console.log("method", method)
//             console.log("cleaned", cleaned)
//             console.log("url", url)
//             const { data } = await axios({ url, method, data: cleaned, withCredentials: true });

//             onSuccess?.(data);
//         } catch (err) {
//             setServerError(err?.response?.data?.error || err?.message || "שגיאת שרת לא ידועה");
//         } finally {
//             setSubmitting(false);
//         }
//     };

//     const ActiveComponent = PANELS.find(p => p.id === active)?.Component ?? null;

//     return (
//         <FormProvider {...methods}>
//             <form dir="rtl" noValidate onSubmit={methods.handleSubmit(onSubmit)}>

//                 {/* סרגל עליון */}
//                 <div className="flex items-center justify-between mb-4">
//                     <h1 className="text-xl font-semibold">{mode === "edit" ? "עריכת מוצר" : "הוספת מוצר חדש"}</h1>
//                     <div className="flex gap-2">
//                         <button
//                             type="button"
//                             className="px-4 py-2 rounded-xl border"
//                             onClick={() => methods.reset(defaults)}
//                         >
//                             אפס
//                         </button>
//                         <button
//                             type="submit"
//                             disabled={submitting}
//                             className="px-4 py-2 rounded-xl border bg-blue-600 text-white disabled:opacity-60"
//                         >
//                             {submitting ? "שומר..." : mode === "edit" ? "שמירת שינויים" : "שמירה"}
//                         </button>
//                     </div>
//                 </div>

//                 {/* מידע כללי תמיד למעלה */}
//                 <div className="mb-6">
//                     <ProductGeneralSection />
//                 </div>

//                 {/* פריסה: תוכן משמאל ותפריט ימין (RTL) */}
//                 <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-6">
//                     {/* תוכן */}
//                     <div className="space-y-6">
//                         {ActiveComponent ? <ActiveComponent /> : null}

//                         {serverError ? (
//                             <p className="text-red-700 bg-red-50 border border-red-200 rounded-xl p-3">
//                                 שגיאה בשמירה: {serverError}
//                             </p>
//                         ) : null}

//                         {/* כפתורים גם בתחתית */}
//                         <div className="flex justify-end gap-2">
//                             <button type="button" className="px-4 py-2 rounded-xl border" onClick={() => methods.reset(defaults)}>
//                                 אפס
//                             </button>
//                             <button type="submit" disabled={submitting} className="px-4 py-2 rounded-xl border bg-blue-600 text-white disabled:opacity-60">
//                                 {submitting ? "שומר..." : mode === "edit" ? "שמירת שינויים" : "שמירה"}
//                             </button>
//                         </div>
//                     </div>

//                     {/* תפריט צד כהה כמו בתמונה */}
//                     <aside className="order-first lg:order-none">
//                         <div className="sticky top-4">
//                             <div className="rounded-lg overflow-hidden shadow border border-slate-800">
//                                 {/* כותרת תפריט */}
//                                 <div className="bg-slate-900 text-white px-4 py-3 text-right font-semibold">
//                                     תצורת מוצר
//                                 </div>

//                                 {/* פריטי תפריט */}
//                                 <ul className="bg-slate-900 text-slate-100 divide-y divide-slate-800">
//                                     {PANELS.map((p) => {
//                                         const isActive = active === p.id;
//                                         return (
//                                             <li key={p.id}>
//                                                 <button
//                                                     type="button"
//                                                     onClick={() => setActive(p.id)}
//                                                     className={`w-full text-right px-4 py-3 flex items-center justify-between gap-3
//                                       transition-colors
//                                       ${isActive ? "bg-slate-800" : "hover:bg-slate-800/70"}`}
//                                                     title={p.label}
//                                                 >
//                                                     <span className="flex items-center gap-2">
//                                                         <span className="opacity-90">{p.icon}</span>
//                                                         <span>{p.label}</span>
//                                                     </span>

//                                                     {/* חץ קטן (למראה אקורדיון) */}
//                                                     <span className={`transition-transform ${isActive ? "rotate-180" : ""}`}>▾</span>
//                                                 </button>
//                                             </li>
//                                         );
//                                     })}
//                                 </ul>
//                             </div>
//                         </div>
//                     </aside>
//                 </div>
//             </form>
//         </FormProvider>
//     );
// }






















// src/components/product/forms/ProductForm.jsx
import { useMemo, useState } from "react";
import { useForm, FormProvider } from "react-hook-form";

// סקשנים
import ProductGeneralSection from "./ProductGeneralSection";
import ProductDescriptionSection from "./ProductDescriptionSection";
import ProductOverviewSection from "./ProductOverviewSection";
import ProductSpecsSection from "./ProductSpecsSection";
import ProductMediaSection from "./ProductMediaSection";
import ProductShippingSection from "./ProductShippingSection";
import ProductInventorySection from "./ProductInventorySection";
import ProductPricingSection from "./ProductPricingSection";
import ProductSeoSection from "./ProductSeoSection";
import ProductVisibilitySection from "./ProductVisibilitySection";
import ProductAdminSection from "./ProductAdminSection";
import ProductVariationsSection from "./ProductVariationsSection";

// Redux API
import {
    useCreateSellerProductMutation,
    useUpdateSellerProductMutation,
} from "../../../../redux/services/sellerProductsApi";
// ---------- utils ----------
function toISOorNull(s) {
    if (!s) return null;
    const d = new Date(s);
    return Number.isNaN(d.valueOf()) ? null : d.toISOString();
}
function pairsToMap(pairs = []) {
    const obj = {};
    for (const { key, value } of pairs) {
        const k = (key || "").trim();
        if (k) obj[k] = (value || "").trim();
    }
    return obj;
}
function clean(obj) {
    const out = Array.isArray(obj) ? [] : {};
    const isEmpty = (v) =>
        v === "" ||
        v === undefined ||
        v === null ||
        (Array.isArray(v) && v.length === 0) ||
        (typeof v === "object" && v !== null && Object.keys(v).length === 0);
    for (const [k, v] of Object.entries(obj || {})) {
        if (v && typeof v === "object" && !Array.isArray(v)) {
            const nested = clean(v);
            if (!isEmpty(nested)) out[k] = nested;
        } else if (!isEmpty(v)) {
            out[k] = v;
        }
    }
    return out;
}

const defaultValuesMaster = {
    title: "",
    titleEn: "",
    brand: "",
    category: "אחר",
    subCategory: "",
    warranty: "12 חודשים אחריות יבואן רשמי",
    description: "",
    overview: { text: "", images: [], videos: [] },
    specsPairs: [],
    images: [],
    video: "",
    shipping: { dimensions: { length: 0, width: 0, height: 0 }, weight: "", from: "IL" },
    delivery: { requiresDelivery: false, cost: 0, notes: "" },
    sku: "",
    stock: 0,
    gtin: "",
    inStock: false,
    currency: "ILS",
    price: { amount: 0 },
    discount: { discountType: "", discountValue: undefined, startsAt: "", expiresAt: "" },
    slug: "",
    metaTitle: "",
    metaDescription: "",
    visibility: "public",
    scheduledAt: "",
    visibleUntil: "",
    status: "טיוטא",
    sellerSku: "",
    model: "",
    supplier: "",
    variations: [],
    variationsConfig: { priceRule: "sum", attributes: [] },
};

// ---------- הגדרת התפריט הימני ----------
const PANELS = [
    { id: "media", label: "מדיה", icon: "🖼️", Component: ProductMediaSection },
    { id: "pricing", label: "מחירון", icon: "₪", Component: ProductPricingSection },
    { id: "inventory", label: "מלאי", icon: "📦", Component: ProductInventorySection },
    { id: "shipping", label: "משלוח", icon: "🚚", Component: ProductShippingSection },
    { id: "seo", label: "SEO", icon: "🔎", Component: ProductSeoSection },
    { id: "visibility", label: "נראות", icon: "👁️", Component: ProductVisibilitySection },
    { id: "admin", label: "ניהול", icon: "⚙️", Component: ProductAdminSection },
    { id: "variations", label: "וריאציות", icon: "🧩", Component: ProductVariationsSection },
    { id: "specs", label: "מפרט טכני", icon: "📑", Component: ProductSpecsSection },
    { id: "overview", label: "סקירה", icon: "📝", Component: ProductOverviewSection },
    { id: "description", label: "תיאור", icon: "✒️", Component: ProductDescriptionSection },
];

export default function ProductForm({
    mode = "create",
    initialData = null,
    onSuccess,
}) {
    const [serverError, setServerError] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [active, setActive] = useState("media"); // רק אחד פתוח

    const [createSellerProduct] = useCreateSellerProductMutation();
    const [updateSellerProduct] = useUpdateSellerProductMutation();

    const defaults = useMemo(() => {
        if (!initialData) return defaultValuesMaster;
        return {
            ...defaultValuesMaster,
            ...initialData,
            overview: { ...defaultValuesMaster.overview, ...initialData.overview },
            shipping: { ...defaultValuesMaster.shipping, ...initialData.shipping },
            delivery: { ...defaultValuesMaster.delivery, ...initialData.delivery },
            price: { ...defaultValuesMaster.price, ...initialData.price },
            discount: { ...defaultValuesMaster.discount, ...initialData.discount },
            variations: initialData.variations || [],
            variationsConfig: { priceRule: "sum", attributes: [] },
        };
    }, [initialData]);

    const methods = useForm({
        defaultValues: defaults,
        mode: "onSubmit",
        shouldUnregister: false,
    });

    const onSubmit = async (values) => {
        setServerError(null);
        setSubmitting(true);
        try {
            const payload = { ...values };
            payload.specs = pairsToMap(values.specsPairs);
            delete payload.specsPairs;

            payload.discount = payload.discount || {};
            payload.discount.startsAt = toISOorNull(values.discount?.startsAt || "");
            payload.discount.expiresAt = toISOorNull(values.discount?.expiresAt || "");
            const hasType = payload.discount?.discountType?.trim?.();
            const hasVal =
                typeof payload.discount?.discountValue === "number" &&
                !Number.isNaN(payload.discount.discountValue);
            if (!hasType || !hasVal) delete payload.discount;

            payload.scheduledAt = toISOorNull(values.scheduledAt || "");
            payload.visibleUntil = toISOorNull(values.visibleUntil || "");

            payload.variations = (values.variations || []).map((v) => ({
                ...v,
                discount: v.discount
                    ? {
                        ...v.discount,
                        startsAt: toISOorNull(v.discount.startsAt || ""),
                        expiresAt: toISOorNull(v.discount.expiresAt || ""),
                    }
                    : undefined,
                price:
                    v?.price && typeof v.price.amount === "number" && !Number.isNaN(v.price.amount)
                        ? v.price
                        : undefined,
            }));

            const statusMap = { "טיוטא": "draft", "מפורסם": "published", "מושהה": "suspended" };
            payload.status = statusMap[payload.status] || payload.status;

            if (!payload.metaTitle?.trim()) {
                const parts = [];
                if (payload.title) parts.push(payload.title);
                const bm = [payload.brand, payload.model].filter(Boolean).join(" ");
                if (bm && !String(payload.title || "").includes(bm)) parts.push(bm);
                parts.push("משלוח מהיר 48 שעות", "EXPRESS48");
                payload.metaTitle = parts.filter(Boolean).join(" - ").slice(0, 60);
            }

            delete payload.variationsConfig;

            const cleaned = clean(payload);

            let result;
            if (mode === "edit" && initialData?._id) {
                result = await updateSellerProduct({ id: initialData._id, ...cleaned }).unwrap();
            } else {
                result = await createSellerProduct(cleaned).unwrap();
            }

            onSuccess?.(result);
        } catch (err) {
            setServerError(err?.data?.error || err?.message || "שגיאת שרת לא ידועה");
        } finally {
            setSubmitting(false);
        }
    };

    const ActiveComponent = PANELS.find((p) => p.id === active)?.Component ?? null;

    return (
        <FormProvider {...methods}>
            <form dir="rtl" noValidate onSubmit={methods.handleSubmit(onSubmit)}>
                {/* סרגל עליון */}
                <div className="flex items-center justify-between mb-4">
                    <h1 className="text-xl font-semibold">
                        {mode === "edit" ? "עריכת מוצר" : "הוספת מוצר חדש"}
                    </h1>
                    <div className="flex gap-2">
                        <button
                            type="button"
                            className="px-4 py-2 rounded-xl border"
                            onClick={() => methods.reset(defaults)}
                        >
                            אפס
                        </button>
                        <button
                            type="submit"
                            disabled={submitting}
                            className="px-4 py-2 rounded-xl border bg-blue-600 text-white disabled:opacity-60"
                        >
                            {submitting
                                ? "שומר..."
                                : mode === "edit"
                                    ? "שמירת שינויים"
                                    : "שמירה"}
                        </button>
                    </div>
                </div>

                {/* מידע כללי תמיד למעלה */}
                <div className="mb-6">
                    <ProductGeneralSection />
                </div>

                {/* פריסה: תוכן משמאל ותפריט ימין */}
                <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-6">
                    {/* תוכן */}
                    <div className="space-y-6">
                        {ActiveComponent ? <ActiveComponent /> : null}

                        {serverError ? (
                            <p className="text-red-700 bg-red-50 border border-red-200 rounded-xl p-3">
                                שגיאה בשמירה: {serverError}
                            </p>
                        ) : null}

                        {/* כפתורים גם בתחתית */}
                        <div className="flex justify-end gap-2">
                            <button
                                type="button"
                                className="px-4 py-2 rounded-xl border"
                                onClick={() => methods.reset(defaults)}
                            >
                                אפס
                            </button>
                            <button
                                type="submit"
                                disabled={submitting}
                                className="px-4 py-2 rounded-xl border bg-blue-600 text-white disabled:opacity-60"
                            >
                                {submitting
                                    ? "שומר..."
                                    : mode === "edit"
                                        ? "שמירת שינויים"
                                        : "שמירה"}
                            </button>
                        </div>
                    </div>

                    {/* תפריט צד */}
                    <aside className="order-first lg:order-none">
                        <div className="sticky top-4">
                            <div className="rounded-lg overflow-hidden shadow border border-slate-800">
                                <div className="bg-slate-900 text-white px-4 py-3 text-right font-semibold">
                                    תצורת מוצר
                                </div>
                                <ul className="bg-slate-900 text-slate-100 divide-y divide-slate-800">
                                    {PANELS.map((p) => {
                                        const isActive = active === p.id;
                                        return (
                                            <li key={p.id}>
                                                <button
                                                    type="button"
                                                    onClick={() => setActive(p.id)}
                                                    className={`w-full text-right px-4 py-3 flex items-center justify-between gap-3
                            transition-colors
                            ${isActive ? "bg-slate-800" : "hover:bg-slate-800/70"}`}
                                                    title={p.label}
                                                >
                                                    <span className="flex items-center gap-2">
                                                        <span className="opacity-90">{p.icon}</span>
                                                        <span>{p.label}</span>
                                                    </span>
                                                    <span
                                                        className={`transition-transform ${isActive ? "rotate-180" : ""}`}
                                                    >
                                                        ▾
                                                    </span>
                                                </button>
                                            </li>
                                        );
                                    })}
                                </ul>
                            </div>
                        </div>
                    </aside>
                </div>
            </form>
        </FormProvider>
    );
}


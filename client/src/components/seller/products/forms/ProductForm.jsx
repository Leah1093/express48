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
function buildBlocksFromOverview(overview) {
  if (!overview) return [];

  // אם כבר יש blocks – פשוט נחזיר אותם
  if (Array.isArray(overview.blocks) && overview.blocks.length > 0) {
    return overview.blocks;
  }

  const blocks = [];

  // טקסט ישן → בלוק טקסט
  if (overview.text) {
    blocks.push({
      type: "text",
      html: overview.text,
    });
  }

  // תמונות ישנות → בלוקי תמונה
  (overview.images || []).forEach((url) => {
    if (!url) return;
    blocks.push({
      type: "image",
      url,
      sourceType: "url",
    });
  });

  // וידאו ישן → בלוקי וידאו
  (overview.videos || []).forEach((videoUrl) => {
    if (!videoUrl) return;
    blocks.push({
      type: "video",
      videoUrl,
      provider: "youtube",
    });
  });

  return blocks;
}

function splitOverviewFromBlocks(blocks = [], fallbackOverview = {}) {
  const textParts = [];
  const images = [];
  const videos = [];

  for (const b of blocks) {
    if (!b || typeof b !== "object") continue;

    if (b.type === "text" && b.html) {
      textParts.push(b.html);
    } else if (b.type === "image" && b.url) {
      images.push(b.url);
    } else if (b.type === "video" && b.videoUrl) {
      videos.push(b.videoUrl);
    }
  }

  const text =
    textParts.length > 0
      ? textParts.join("<br/><br/>")
      : fallbackOverview.text || "";

  const finalImages =
    images.length > 0 ? images : fallbackOverview.images || [];

  const finalVideos =
    videos.length > 0 ? videos : fallbackOverview.videos || [];

  return { text, images: finalImages, videos: finalVideos };
}

const defaultValuesMaster = {
  title: "",
  titleEn: "",
  brand: "",
  category: "אחר",
  subCategory: "",
  warranty: "12 חודשים אחריות יבואן רשמי",
  description: "",
  overview: { text: "", images: [], videos: [], blocks: [] },
  specsPairs: [],
  images: [],
  video: "",
  shipping: {
    dimensions: { length: 0, width: 0, height: 0 },
    weight: "",
    from: "IL",
  },
  delivery: { requiresDelivery: false, cost: 0, notes: "" },
  sku: "",
  stock: 0,
  gtin: "",
  inStock: false,
  currency: "ILS",
  price: { amount: 0 },
  discount: {
    discountType: "",
    discountValue: undefined,
    startsAt: "",
    expiresAt: "",
  },
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
  {
    id: "pricing",
    label: "מחירון",
    icon: "₪",
    Component: ProductPricingSection,
  },
  {
    id: "inventory",
    label: "מלאי",
    icon: "📦",
    Component: ProductInventorySection,
  },
  {
    id: "shipping",
    label: "משלוח",
    icon: "🚚",
    Component: ProductShippingSection,
  },
  { id: "seo", label: "SEO", icon: "🔎", Component: ProductSeoSection },
  {
    id: "visibility",
    label: "נראות",
    icon: "👁️",
    Component: ProductVisibilitySection,
  },
  { id: "admin", label: "ניהול", icon: "⚙️", Component: ProductAdminSection },
  {
    id: "variations",
    label: "וריאציות",
    icon: "🧩",
    Component: ProductVariationsSection,
  },
  {
    id: "specs",
    label: "מפרט טכני",
    icon: "📑",
    Component: ProductSpecsSection,
  },
  {
    id: "overview",
    label: "סקירה",
    icon: "📝",
    Component: ProductOverviewSection,
  },
  {
    id: "description",
    label: "תיאור",
    icon: "✒️",
    Component: ProductDescriptionSection,
  },
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
    const overview = initialData.overview || {};
    const blocks = buildBlocksFromOverview(overview);

    return {
      ...defaultValuesMaster,
      ...initialData,
      overview: {
        text: overview.text || "",
        images: overview.images || [],
        videos: overview.videos || [],
        blocks, // כאן הבלוקים שנבנו
      },
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
      console.log("🧪 values.overview:", values.overview);
  console.log("🧪 values.overview.blocks:", values.overview?.blocks);

  setServerError(null);
  setSubmitting(true);
  try {
    const payload = { ...values };

    // --- סקירה: פיצול מ־blocks לשדות text/images/videos ---
    const blocks = values.overview?.blocks || [];
    const { text, images, videos } = splitOverviewFromBlocks(
      blocks,
      values.overview || {}
    );

    payload.overview = {
      text,
      images,
      videos,
      blocks
    };
console.log("🧪 payload.overview שנשלח לשרת:", payload.overview);
    // --- המשך כמו שהיה לך קודם ---
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
      result = await updateSellerProduct({
        id: initialData._id,
        ...cleaned,
      }).unwrap();
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


  const ActiveComponent =
    PANELS.find((p) => p.id === active)?.Component ?? null;

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
                            ${
                              isActive
                                ? "bg-slate-800"
                                : "hover:bg-slate-800/70"
                            }`}
                          title={p.label}
                        >
                          <span className="flex items-center gap-2">
                            <span className="opacity-90">{p.icon}</span>
                            <span>{p.label}</span>
                          </span>
                          <span
                            className={`transition-transform ${
                              isActive ? "rotate-180" : ""
                            }`}
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

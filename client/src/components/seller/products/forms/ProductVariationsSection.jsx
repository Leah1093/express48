import { useState, useEffect } from "react";
import { useFormContext } from "react-hook-form";
import PriceRuleSelector from "./PriceRuleSelector";
import VariationAttributesBuilder from "./VariationAttributesBuilder";
import VariationsPreview from "./VariationsPreview";
import { generateCombinations, calculateVariationPrice } from "./variationUtils";

export default function ProductVariationsSection() {
  const { watch, setValue, register, trigger } = useFormContext();

  const basePrice = watch("price.amount") || 0;
  const priceRule = watch("variationsConfig.priceRule");
  const attributes = watch("variationsConfig.attributes") || [];
  const variations = watch("variations") || [];

  const [localPreview, setLocalPreview] = useState([]);

  const canPreview =
    attributes.length > 0 && attributes.every((a) => (a.terms || []).length > 0);

  // רישום השדה ל־RHF (תאורטי בלבד; כבר יש defaultValues)


  const handleBuildPreview = () => {
    const combos = generateCombinations(attributes);

    const built = combos.map((c) => {
      const calc = calculateVariationPrice({
        basePrice,
        priceRule,
        attributes,
        combination: c,
      });

      // התאמה לוריאציה קיימת (אם יש) לפי ה־attributes
      const existing = (variations || []).find((v) => {
        const a = v.attributes || {};
        const keys = Object.keys(c);
        return keys.length === Object.keys(a).length && keys.every((k) => a[k] === c[k]);
      });

      // נרמול כדי למנוע אובייקטי Number וכד'
      const normalizedAmount = Number(
        existing?._manualOverride ?? (typeof calc === "object" ? calc?.valueOf?.() : calc) ?? 0
      );

      return {
        sku: existing?.sku || "",
        sellerSku: existing?.sellerSku || "",
        gtin: existing?.gtin || "",
        attributes: c,
        price: {
          amount: normalizedAmount, // מספר פרימיטיבי
          currency: "ILS",
        },
        stock: Number(existing?.stock ?? 0),
        inStock: Boolean(existing?.inStock ?? (Number(existing?.stock ?? 0) > 0)),
        images: Array.isArray(existing?.images)
          ? existing.images
          : Array.isArray(calc?.inheritedImages)
            ? calc.inheritedImages
            : [],
        active: existing?.active ?? true,
        _calculatedPrice: Number(
          (typeof calc === "object" ? calc?.valueOf?.() : calc) ?? normalizedAmount
        ),
        _manualOverride:
          existing?._manualOverride != null ? Number(existing._manualOverride) : undefined,
      };
    });

    setLocalPreview(built);
  };

  const handleAcceptPreview = async () => {
    // חשוב: זה נתונים, לא "schema"
    console.log("preview is", localPreview);

    // ודא המרות למספרים פרימיטיביים (עובר שוב בכדי להיות חסין)
    const safe = (localPreview || []).map((v) => ({
      ...v,
      price: {
        amount: Number(v?.price?.amount ?? 0),
        currency: v?.price?.currency || "ILS",
      },
      stock: Number(v?.stock ?? 0),
      inStock: Boolean(v?.inStock ?? (Number(v?.stock ?? 0) > 0)),
      _calculatedPrice:
        v?._calculatedPrice != null ? Number(v._calculatedPrice) : undefined,
      _manualOverride:
        v?._manualOverride != null ? Number(v._manualOverride) : undefined,
    }));
    console.log("safe", safe);

setValue("variations", safe, { shouldDirty: true, shouldTouch: true, shouldValidate: false });
   };

  return (
    <section className="rounded-2xl border bg-white shadow-sm p-4 space-y-4" dir="rtl">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-semibold">וריאציות</h2>
        <div className="text-sm opacity-70">מחיר בסיס נוכחי: {basePrice || 0} ₪</div>
      </header>

      <PriceRuleSelector />
      <VariationAttributesBuilder />

      <div className="flex gap-2">
        <button
          type="button"
          className="px-4 py-2 rounded-xl border"
          disabled={!canPreview}
          onClick={handleBuildPreview}
        >
          סקירת וריאציות
        </button>
        <button
          type="button"
          className="px-4 py-2 rounded-xl border bg-blue-600 text-white disabled:opacity-60"
          disabled={!localPreview.length}
          onClick={handleAcceptPreview}
        >
          החל סקירה למוצר
        </button>
      </div>

      <VariationsPreview items={localPreview.length ? localPreview : variations} />
    </section>
  );
}

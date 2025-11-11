// ProductTabs.jsx
import { useState, useMemo } from "react";
import ProductOverview from "./ProductOverview";
import ProductSpecs from "./ProductSpecs";
import ProductReviews from "./ProductReviews";
// import ProductQA from "./ProductQA";

export default function ProductTabs({
  overview,
  specs,
  reviews,
  qa,
  description,
  warranty,
}) {
  const ALL = [
    { key: "qa", label: "שאלות ותשובות", has: !!qa },
    { key: "reviews", label: "ביקורות", has: (reviews?.length ?? 0) > 0 },
    { key: "specs", label: "מפרט טכני", has: !!specs },
    {
      key: "overview",
      label: " תיאור",
      has: !!overview || !!description || !!warranty,
    },
    // { key: "description", label: "תיאור", has: !!description },
  ];

  // ברירת מחדל: הטאב הראשון שיש לו תוכן, ואם אין — הראשון ברשימה
  const firstWithContent = useMemo(
    () =>  (overview || description || warranty)
        ? "overview"
        :ALL.find((t) => t.has)?.key ?? ALL[0].key,
    [description,overview,warranty ,specs, reviews, qa ]
  );
  const [active, setActive] = useState(firstWithContent);

  return (
    <div className="w-full">
      {/* שורת טאבים עם קו תחתון */}
      <div
        role="tablist"
        className="flex items-start self-stretch border-b border-[#EDEDED]"
      >
        {ALL.map((t) => {
          const isActive = active === t.key;
          return (
            <button
              key={t.key}
              type="button"
              role="tab"
              aria-selected={isActive}
              aria-disabled={!t.has}
              onClick={() => t.has && setActive(t.key)}
              className={`flex-1 h-[31px] px-2 py-1 flex justify-center items-center
                          text-[14px] leading-[1.2] font-normal
                          ${
                            t.has
                              ? "text-[#101010] cursor-pointer"
                              : "text-[#4A5565] opacity-50 cursor-not-allowed"
                          }
                          border ${
                            isActive ? "border-[#FF6500]" : "border-transparent"
                          } transition`}
            >
              {t.label}
            </button>
          );
        })}
      </div>

      {/* תוכן */}
      <div className="py-4">
        {active === "overview" && (overview || description || warranty) && (
          <ProductOverview
            overview={overview}
            description={description}
            warranty={warranty}
          />
        )}
        {active === "specs" && specs && <ProductSpecs specs={specs} />}
        {active === "reviews" && (reviews?.length ?? 0) > 0 && (
          <ProductReviews reviews={reviews} />
        )}
        {/* {active === "qa" && qa && <ProductQA items={qa} />} */}
      </div>
    </div>
  );
}

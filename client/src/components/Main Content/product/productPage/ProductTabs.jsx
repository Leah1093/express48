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
    {
      key: "overview",
      label: "תיאור",
      has: !!overview || !!description || !!warranty,
    },
    { key: "specs", label: "מפרט טכני", has: !!specs },
    { key: "reviews", label: "ביקורות", has: (reviews?.length ?? 0) > 0 },
    { key: "qa", label: "שאלות ותשובות", has: !!qa },
  ];

  // ברירת מחדל לדסקטופ: תיאור אם יש, אחרת הטאב הראשון שיש לו תוכן
  const firstWithContent = useMemo(
    () =>
      overview || description || warranty
        ? "overview"
        : ALL.find((t) => t.has)?.key ?? ALL[0].key,
    [description, overview, warranty, specs, reviews, qa]
  );

  const [active, setActive] = useState(firstWithContent);

  // פונקציה שמחזירה את התוכן לפי key
  const renderSection = (key) => {
    if (key === "overview" && (overview || description || warranty)) {
      return (
        <ProductOverview
          overview={overview}
          description={description}
          warranty={warranty}
        />
      );
    }

    if (key === "specs" && specs) {
      return <ProductSpecs specs={specs} />;
    }

    if (key === "reviews" && (reviews?.length ?? 0) > 0) {
      return <ProductReviews reviews={reviews} />;
    }

    // if (key === "qa" && qa) {
    //   return <ProductQA items={qa} />;
    // }

    return null;
  };

  return (
    <div className="w-full">
      {/* ===== מובייל – כל טאב עם הכותרת ואחריה התוכן ===== */}
      <div className="md:hidden space-y-4">
        {ALL.filter((t) => t.has).map((t) => (
          <section key={t.key} className="border-b border-[#EDEDED] pb-4">
            {/* כותרת בסגנון טאב */}
            <div
              className="
                w-full h-[40px]
                px-2 py-1
                flex justify-center items-center
                text-[14px] leading-[1.2] font-normal
                rounded-md
                border border-[#FF6500] bg-white
                text-[#101010]
              "
            >
              {t.label}
            </div>

            {/* התוכן מיד מתחת לכותרת */}
            <div className="pt-3">
              {renderSection(t.key)}
            </div>
          </section>
        ))}
      </div>

      {/* ===== דסקטופ – טאבים רגילים ===== */}
      <div className="hidden md:block">
        {/* שורת טאבים */}
        <div
          role="tablist"
          className="
            flex w-full
            flex-row
            items-stretch
            border-b border-[#EDEDED]
          "
        >
          {ALL.map((t) => {
            const isActive = active === t.key;
            const isDisabled = !t.has;

            return (
              <button
                key={t.key}
                type="button"
                role="tab"
                aria-selected={isActive}
                aria-disabled={isDisabled}
                onClick={() => !isDisabled && setActive(t.key)}
                className={`
                  flex-1
                  h-[31px]
                  px-2 py-1
                  flex justify-center items-center
                  text-[14px] leading-[1.2] font-normal
                  ${
                    isDisabled
                      ? "text-[#4A5565] opacity-50 cursor-not-allowed"
                      : "text-[#101010] cursor-pointer"
                  }
                  border
                  ${
                    isActive
                      ? "border-[#FF6500] bg-white"
                      : "border-transparent bg-transparent"
                  }
                  transition
                `}
              >
                {t.label}
              </button>
            );
          })}
        </div>

        {/* תוכן לפי טאב פעיל */}
        <div className="py-4">
          {renderSection(active)}
        </div>
      </div>
    </div>
  );
}

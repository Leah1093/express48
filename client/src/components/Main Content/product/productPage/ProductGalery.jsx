import { useState, useEffect, useMemo } from "react";

export default function ProductGallery({ product, selectedVariation }) {
  // מקור התמונות: וריאציה נבחרת > תמונות מוצר > []
  const images = useMemo(
    () =>
      selectedVariation?.images?.length
        ? selectedVariation.images
        : product?.images?.length
        ? product.images
        : [],
    [selectedVariation?.images, product?.images]
  );

  const [selectedImage, setSelectedImage] = useState(images[0] || "");
  const [fade, setFade] = useState(true);

  useEffect(() => {
    // כשמתחלף מקור התמונות (וריאציה/מוצר) - בוחרים תמיד את הראשונה
    setSelectedImage(images[0] || "");
  }, [images]);

  const handleChangeImage = (img) => {
    if (!img || img === selectedImage) return;
    setFade(false);
    setTimeout(() => {
      setSelectedImage(img);
      setFade(true);
    }, 200);
  };

  if (!images.length) {
    return (
      <div className="w-full rounded-[10.239px] border border-[#EDEDED] bg-white p-4">
        <div className="text-sm text-[#4A5565]">אין תמונות להצגה</div>
      </div>
    );
  }

  return (
    <div
      className="
        w-full max-w-full
        rounded-[10.239px] border border-[#EDEDED] bg-white
        p-4 sm:p-5
      "
      dir="rtl"
    >
{/* ===== מובייל: רק תמונה אחת בגלילה לצד, עם הצצה לסלייד הבא ===== */}
<div className="md:hidden">
  <div
    className="
      flex w-full gap-3
      overflow-x-auto
      snap-x snap-mandatory
      pb-1 px-2
    "
    style={{ direction: "rtl" }}
    aria-label="גלריית תמונות – מובייל"
  >
    {images.map((img, i) => (
      <div
        key={i}
        className="
          snap-center flex-shrink-0
          w-5/6       /* 90% מהרוחב */
          sm:w-2/3    /* במסכים קצת יותר רחבים - 66% */
          aspect-[3/4]
          rounded-[10.239px]
          overflow-hidden
          border border-[#EDEDED]
        "
      >
        <div
          className="w-full h-full"
          style={{
            backgroundImage: `url("${img}")`,
            backgroundPosition: "50% 50%",
            backgroundRepeat: "no-repeat",
            backgroundSize: "cover",
            backgroundColor: "lightgray",
          }}
          aria-label={`תמונה ${i + 1}`}
        />
      </div>
    ))}
  </div>
</div>


      {/* ===== דסקטופ: תמונה ראשית + תמונות קטנות למטה ===== */}
      <div className="hidden md:flex md:flex-col md:items-start md:gap-4 lg:gap-5">
        {/* תמונה ראשית */}
        <div
          className={`
            w-full max-w-full
            rounded-[10.239px]
            overflow-hidden
            border border-[#EDEDED]
            transition-opacity duration-200
            ${fade ? "opacity-100" : "opacity-0"}
            aspect-square lg:w-[617.465px] lg:h-[617.465px]
          `}
          style={{
            backgroundImage: selectedImage
              ? `url("${selectedImage}")`
              : "none",
            backgroundPosition: "50% 50%",
            backgroundRepeat: "no-repeat",
            backgroundSize: "cover",
            backgroundColor: selectedImage ? "transparent" : "lightgray",
          }}
          aria-label="תמונה ראשית"
        />

        {/* שורת תמונות קטנות */}
        <div
          className="
            w-full flex gap-3 sm:gap-4
            overflow-x-auto
            pr-1
          "
          style={{ direction: "rtl" }}
          aria-label="גלריית תמונות קטנות"
        >
          {images.map((img, i) => {
            const isActive = selectedImage === img;
            return (
              <button
                key={i}
                type="button"
                onClick={() => handleChangeImage(img)}
                className={`
                  flex-shrink-0
                  rounded-[10.239px]
                  border ${
                    isActive
                      ? "border-[#FF6500]"
                      : "border-[#EDEDED] hover:border-gray-400"
                  }
                  transition
                  focus:outline-none focus:ring-2 focus:ring-[#FF6500]/40
                  w-[96px] h-[96px] sm:w-[110px] sm:h-[110px] lg:w-[126.366px] lg:h-[126.366px]
                `}
                aria-current={isActive ? "true" : "false"}
                aria-label={`תמונה ${i + 1}`}
              >
                <div
                  className="w-full h-full rounded-[10.239px]"
                  style={{
                    backgroundImage: `url("${img}")`,
                    backgroundPosition: "50% 50%",
                    backgroundRepeat: "no-repeat",
                    backgroundSize: "contain",
                    backgroundColor: "lightgray",
                  }}
                />
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

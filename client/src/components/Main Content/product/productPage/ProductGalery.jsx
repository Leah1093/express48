import { useState } from "react";

export default function ProductGallery({ product }) {
  const [selectedImage, setSelectedImage] = useState(product.images?.[0]);
  const [fade, setFade] = useState(true);

  const handleChangeImage = (img) => {
    if (img === selectedImage) return;
    setFade(false);
    setTimeout(() => {
      setSelectedImage(img);
      setFade(true);
    }, 200);
  };

  return (
    <div className="w-full h-full flex flex-col gap-6">
      {/* === מובייל: גלילה אופקית של התמונות === */}
      <div className="flex md:hidden gap-4 w-full overflow-x-auto snap-x snap-mandatory scroll-smooth scrollbar-hide">
        {product.images?.map((img, i) => (
          <div
            key={i}
            className="flex-shrink-0 w-[85%] h-[320px] snap-center rounded-[12px] border border-[#EDEDED] overflow-hidden"
          >
            <img
              src={img}
              alt={`mobile-${i}`}
              className="w-full h-full object-contain"
            />
          </div>
        ))}
      </div>


      {/* === דסקטופ: תמונה גדולה + שורת תמונות קטנות === */}
      <div className="hidden md:flex flex-col gap-6">
        {/* תמונה ראשית */}
        <div className="flex justify-center items-center w-full aspect-square rounded-[12px] border border-[#EDEDED] overflow-hidden">
          <img
            key={selectedImage}
            src={selectedImage}
            alt="Selected"
            className={`w-full h-full object-contain transition-opacity duration-200 ${fade ? "opacity-100" : "opacity-0"
              }`}
          />
        </div>


        {/* שורת תמונות קטנות */}
        <div className="flex gap-4 w-full overflow-x-auto scrollbar-hide">
          {product.images?.map((img, i) => (
            <div
              key={i}
              onClick={() => handleChangeImage(img)}
              className={`w-[95px] aspect-square flex-shrink-0 cursor-pointer rounded-[12px] border overflow-hidden transition
        ${selectedImage === img
                  ? "border-[#ff6500] bg-[#fff7f2]"
                  : "border-[#EDEDED] hover:border-gray-400"
                }`}
            >
              <img
                src={img}
                alt={`thumb-${i}`}
                className="w-full h-full object-contain"
              />
            </div>
          ))}
        </div>


      </div>

    </div>
  );
}

import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useGetRootCategoriesQuery /*, useGetCategoriesQuery*/ } from "../../redux/services/categoriesApi";

function CategoryCard({ name, iconUrl, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex flex-col items-center justify-start flex-shrink-0 focus:outline-none"
      dir="rtl"
      title={name}
      style={{ width: 90 }}
    >
      <div
        className="rounded-full border"
        style={{
          width: 90,
          height: 90,
          borderColor: "#EDEDED",
          background: iconUrl
            ? `url(${iconUrl}) lightgray 50% / cover no-repeat`
            : "lightgray",
        }}
      />
      <span
        className="
          mt-2 text-center text-[#141414]
          font-normal leading-[120%] tracking-[-0.198px]
          whitespace-nowrap [font-family:Rubik,sans-serif]
          text-[18px] sm:text-[16px]
        "
        style={{ alignSelf: "stretch" }}
      >
        {name}
      </span>
    </button>
  );
}

export default function CategoryRowMarquee() {
  const navigate = useNavigate();

  // 1) מביא רק שורשים
  const { data: rootsData = [], isFetching } = useGetRootCategoriesQuery();

  // אם מסיבה כלשהי אין לך /roots אפשר לגבות כך:
  // const { data: all = [] } = useGetCategoriesQuery({ parent: null });
  // const rootsData = all;

  const BASE_URL = import.meta.env.VITE_API_URL || "https://api.express48.com";

  const roots = useMemo(
    () =>
      (rootsData || []).map((c) => ({
        _id: c._id,
        name: c.name,
        iconUrl: c.icon ? `${BASE_URL}${c.icon}` : "",
        fullSlug: c.fullSlug,
      })),
    [rootsData, BASE_URL]
  );

  // 2) לוגיקת מרקיזה — רק אם יש overflow ורק אחרי שהשורה מלאה על המסך
  const wrapRef = useRef(null);
  const trackRef = useRef(null);
  const [needMarquee, setNeedMarquee] = useState(false);
  const [startMarquee, setStartMarquee] = useState(false);

  useEffect(() => {
    const measure = () => {
      const wrap = wrapRef.current;
      const track = trackRef.current;
      if (!wrap || !track) return;
      const overflow = track.scrollWidth > wrap.clientWidth + 2;
      setNeedMarquee(overflow);

      if (overflow) {
        setStartMarquee(false);
        requestAnimationFrame(() => setTimeout(() => setStartMarquee(true), 400));
      } else {
        setStartMarquee(false);
      }
    };

    // מודדים אחרי הרנדר כדי להבטיח "מלא מסך" לפני החלטה
    requestAnimationFrame(measure);

    const ro = new ResizeObserver(() => requestAnimationFrame(measure));
    if (wrapRef.current) ro.observe(wrapRef.current);

    return () => ro.disconnect();
  }, [roots.length]);

  const onClickCat = (cat) => {
    const url = cat?.fullSlug ? `/products/${cat.fullSlug}` : `/products/${cat._id}`;
    navigate(url);
  };

  if (isFetching) {
    return <div className="w-full py-4 px-4" dir="rtl" />;
  }

  return (
    <div className="w-full bg-white py-4 px-4" dir="rtl">
      <div ref={wrapRef} className="relative w-full overflow-hidden mx-auto">
        <div
          ref={trackRef}
          className={`
            flex items-center gap-6
            ${needMarquee ? "justify-start" : "justify-center"}
            ${needMarquee && startMarquee ? "will-change-transform" : ""}
          `}
          style={
            needMarquee && startMarquee
              ? {
                  ["--speed"]: "28s",
                  animation: "marquee-slide var(--speed) linear infinite reverse",
                }
              : undefined
          }
        >
          {(needMarquee ? roots.concat(roots) : roots).map((cat, idx) => (
            <CategoryCard
              key={`${cat._id}-${idx}`}
              name={cat.name}
              iconUrl={cat.iconUrl}
              onClick={() => onClickCat(cat)}
            />
          ))}
        </div>

        {/* עצירת המרקיזה בהובר */}
        <style>{`
          @keyframes marquee-slide {
            0%   { transform: translateX(0); }
            100% { transform: translateX(-50%); }
          }
          /* pause on hover */
          [dir="rtl"] .w-full.bg-white.py-4.px-4 > div:hover > div {
            animation-play-state: paused;
          }
        `}</style>
      </div>
    </div>
  );
}

export default function RelatedProducts({ related }) {
  return (
    <section className="flex flex-col items-start gap-6 w-full mt-12 translate-y-[-1rem] animate-fade-in  [--animation-delay:200ms]">
      {/* כותרת */}
      <h2 className="w-full text-right font-bold text-2xl text-[#141414]">
        אולי תאהבו גם
      </h2>

      {/* מוצרים קשורים */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 w-full">
        {related.map((p, i) => (
          <div
            key={i}
            className="rounded-xl border border-[#ececec] bg-white p-4 flex flex-col items-center justify-between gap-2 text-center transition hover:shadow-md"
          >
            <img
              src={p.image}
              alt={p.name}
              className="w-[96px] h-[96px] object-contain"
            />
            <div className="text-sm font-semibold text-[#141414] truncate w-full">
              {p.name}
            </div>
            <div className="text-orange-600 font-bold text-base">
              ₪{p.price}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

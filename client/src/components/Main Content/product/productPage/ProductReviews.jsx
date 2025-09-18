import Accordion from "./Accordion.jsx";

export default function ProductReviews({ reviews }) {
  return (
    <section className="flex flex-col items-start gap-6 w-full mt-12 translate-y-[-1rem] animate-fade-in [--animation-delay:200ms]">
      {/* כותרת */}
      <h2 className="w-full text-right font-bold text-2xl text-[#141414]">
        ביקורות
      </h2>

      {/* רשימת ביקורות */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
        {reviews.map((r, i) => (
          <div
            key={i}
            className="rounded-xl border border-[#ececec] bg-[#fafafa] p-4 flex flex-col items-end gap-2 transition hover:shadow-sm"
          >
            <div className="font-semibold text-[#141414]">{r.user}</div>
            <div className="text-orange-600 text-lg">
              {"★".repeat(r.rating)}
              {"☆".repeat(5 - r.rating)}
            </div>
            <div className="text-sm text-[#141414] text-right leading-[160%]">
              {r.text}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

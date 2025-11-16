export default function ProductSpecs({ specs }) {
  if (!specs || Object.keys(specs).length === 0) return null;

  return (
    <section dir="rtl" className="w-full">
      <ul
        className="
          list-none
          pr-3 md:pr-4   /* ריווח מימין – שלא יהיה דבוק למסגרת */
          pl-2           /* קצת ריווח גם משמאל, שיהיה נעים */
          space-y-2
          text-[#141414]
          text-right
          w-full
          text-[14px]
          leading-relaxed
        "
      >
        {Object.entries(specs).map(([k, v], i) => (
          <li key={i}>
            <span className="font-bold">{k}:</span> {v}
          </li>
        ))}
      </ul>
    </section>
  );
}

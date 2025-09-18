import Accordion from "./Accordion.jsx";

export default function ProductSpecs({ specs }) {
  return (
    <Accordion title="מפרט טכני" defaultOpen={false}>
      <ul className="list-none pr-0 space-y-2 text-[#141414] text-right w-full">
        {Object.entries(specs).map(([k, v], i) => (
          <li key={i} className="text-right">
            <span className="font-bold">{k}:</span> {v}
          </li>
        ))}
      </ul>
    </Accordion>
  );
}

import { highlightMatch } from "./utils.jsx";

function PopularSearchesList({ searches, onPick, query }) {
  return (
    <div>
      <div className="text-xs text-gray-400 mb-2">חיפושים נפוצים</div>
      <ul className="flex flex-col gap-2">
        {searches.map((item, idx) => (
          <li
            key={idx}
            className="flex items-center gap-2 cursor-pointer hover:text-orange-500"
            onClick={() => onPick(item.term)}
          >
            <span>{highlightMatch(item.term, query)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default PopularSearchesList;

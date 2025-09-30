import { highlightMatch } from "./utils";

function RecentSearchesList({ searches = [], onPick, onRemove, query }) {
  return (
    <div>
      <div className="text-xs text-gray-400 mb-2">חיפושים אחרונים</div>
      <ul className="flex flex-col gap-2">
        {searches.length > 0 ? (
          searches.map((item, idx) => (
            <li
              key={idx}
              className="flex items-center justify-between gap-2 cursor-pointer group"
            >
              <div
                className="flex items-center gap-2 flex-1 hover:text-orange-500"
                onClick={() => onPick(item)}
              >
                <span>{highlightMatch(item, query)}</span>
              </div>

              {/* כפתור מחיקה */}
              <button
                onClick={(e) => {
                  e.stopPropagation(); // לא להפעיל onPick
                  onRemove(item);
                }}
                className="text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition"
              >
                ✕
              </button>
            </li>
          ))
        ) : (
          <li className="text-gray-300">אין חיפושים אחרונים</li>
        )}
      </ul>
    </div>
  );
}

export default RecentSearchesList;

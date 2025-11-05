// utils.js
import React from "react";

export function highlightMatch(text, query) {
  if (!query) return text;
  const regex = new RegExp(`(${query})`, "gi");
  const parts = text.split(regex);
  return parts.map((part, i) =>
    regex.test(part) ? (
      <span key={i} className="text-orange-500 font-bold">
        {part}
      </span>
    ) : (
      part
    )
  );
}

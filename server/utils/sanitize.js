import sanitizeHtml from "sanitize-html";


export function sanitizeUserText(input) {
  const str = typeof input === "string" ? input : String(input ?? "");
  return sanitizeHtml(str, {
    allowedTags: ["b", "strong", "i", "em", "u", "br", "ul", "ol", "li"],
    allowedAttributes: {},            // לא מאפשרים שום מאפיינים
    disallowedTagsMode: "discard",    // זורק טאגים לא מאושרים
    // מונע הכנסת ישויות מסוכנות
    parser: { lowerCaseTags: true, decodeEntities: true },
    // חיתוך אורך קשיח (הגנה משנית בנוסף ל-maxLength בסכמה/DB)
    textFilter: (text) => text.slice(0, 800),
  });
}


export function sanitizePlainText(input) {
  const str = typeof input === "string" ? input : String(input ?? "");
  // המרה לישויות HTML כך שכל תגיות יהפכו לטקסט
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")
    .slice(0, 800);
}

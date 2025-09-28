// עברית → אנגלית בסיסי
export function transliterateHebrew(str = "") {
  const map = {
    א:"a", ב:"b", ג:"g", ד:"d", ה:"h", ו:"v", ז:"z",
    ח:"ch", ט:"t", י:"y", כ:"k", ך:"k", ל:"l", מ:"m", ם:"m",
    נ:"n", ן:"n", ס:"s", ע:"a", פ:"p", ף:"p", צ:"ts", ץ:"ts",
    ק:"k", ר:"r", ש:"sh", ת:"t"
  };
  return [...str].map(c => map[c] ?? c).join("");
}

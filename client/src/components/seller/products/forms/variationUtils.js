// ייצור כל הקומבינציות בין מונחים של תכונות
export function generateCombinations(attributes = []) {
  if (!attributes.length) return [];
  const arrays = attributes.map(a => a.terms.map(t => ({ attr: a.name, label: t.label })));

  const cartesian = (arrs) =>
    arrs.reduce((acc, curr) => acc.flatMap(x => curr.map(y => [...x, y])), [[]]);

  const tuples = cartesian(arrays);
  return tuples.map(tuple => {
    const obj = {};
    for (const { attr, label } of tuple) obj[attr] = label;
    return obj; // { color: "ורוד", size: "L" }
  });
}

// מוצא term לפי שם תכונה+תווית
function findTerm(attributes, attrName, label) {
  const a = attributes.find(x => x.name === attrName);
  if (!a) return null;
  return a.terms.find(t => t.label === label) || null;
}

// ירושת תמונות: נותן עדיפות לצבע, אח"כ מידה, ואז היתר (אפשר לשנות סדר)
function inheritedImagesForCombination(attributes, combination) {
  const order = ["color", "size"]; // ניתן לשנות
  const result = [];
  // תכונות מועדפות
  for (const key of order) {
    if (combination[key]) {
      const term = findTerm(attributes, key, combination[key]);
      if (term?.images?.length) result.push(...term.images);
    }
  }
  // שאר התכונות
  for (const [k, val] of Object.entries(combination)) {
    if (order.includes(k)) continue;
    const term = findTerm(attributes, k, val);
    if (term?.images?.length) result.push(...term.images);
  }
  // סינון כפולים
  return Array.from(new Set(result));
}

// חישוב מחיר לפי חוק: sum / max, ותמיכה ב-override
export function calculateVariationPrice({ basePrice = 0, priceRule = "sum", attributes = [], combination = {} }) {
  let addons = [];
  let overrides = [];

  for (const [attr, label] of Object.entries(combination)) {
    const term = findTerm(attributes, attr, label);
    if (!term) continue;

    if (term.priceType === "addon" && typeof term.price === "number" && !Number.isNaN(term.price)) {
      addons.push(term.price);
    } else if (term.priceType === "override" && typeof term.price === "number" && !Number.isNaN(term.price)) {
      overrides.push(term.price);
    }
  }

  // אם יש override כלשהו – נבחר את הגבוה כדי לא להוזיל בטעות
  if (overrides.length) {
    const ov = Math.max(...overrides);
    return Object.assign(ov, { inheritedImages: inheritedImagesForCombination(attributes, combination) });
  }

  const inherited = inheritedImagesForCombination(attributes, combination);

  if (!addons.length) {
    return Object.assign(basePrice, { inheritedImages: inherited });
  }

  if (priceRule === "max") {
    const plus = Math.max(...addons);
    return Object.assign(basePrice + plus, { inheritedImages: inherited });
  } else {
    const sum = addons.reduce((a, b) => a + b, 0);
    return Object.assign(basePrice + sum, { inheritedImages: inherited });
  }
}

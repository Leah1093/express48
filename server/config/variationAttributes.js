export const allowedVariationAttributes = [
  "color",       
  "size",        
  "storage",     
  "material",    
  "style",       
  "edition",    
  "capacity",    
  "pack",       
  "flavor",     
  "voltage",   
  "compatibility",
  "mo",
  "sizee"

];

export const categoryVariationMap = {
  "ביגוד": ["size", "color", "material", "style"],
  "נעליים": ["size", "color", "style"],
  "טלפונים": ["color", "storage", "edition"],
  "מחשבים": ["storage", "material", "compatibility"],
  "מטבח": ["color", "capacity", "material"],
  "תוספי תזונה": ["flavor", "pack"]
};

// תוויות לתצוגה ב-UI (אופציונלי)
export const attributeLabels = {
  color: "צבע",
  size: "מידה",
  storage: "אחסון",
  material: "חומר",
  style: "סגנון",
  edition: "מהדורה",
  capacity: "קיבולת",
  pack: "אריזה",
  flavor: "טעם",
  voltage: "מתח",
  compatibility: "תאימות",
  mo: "מערכת הפעלה",
  sizee: "נפח אחסון"

};

// ערכים נפוצים להשלמה/בחירה (אופציונלי)
export const attributeValueHints = {
  color: ["שחור", "לבן", "כחול", "אדום", "ירוק", "אפור", "כסף", "זהב"],
  size: ["XS", "S", "M", "L", "XL", "XXL"],
  storage: ["64GB", "128GB", "256GB", "512GB", "1TB"],
  material: ["כותנה", "אלומיניום", "פלסטיק", "נירוסטה"]
};

// עזר: מאחזיר את הסט המותר עבור קטגוריה נתונה
export function getAllowedVariationKeysForCategory(category) {
  const keys = categoryVariationMap[category];
  return Array.isArray(keys) && keys.length ? keys : allowedVariationAttributes;
}

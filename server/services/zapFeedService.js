// services/zapFeedService.js
import { Product } from "../models/Product.js";
import { Category } from "../models/category.js";

// כתובת בסיס של האתר (אפשר לשנות ל-co.il / com איך שצריך)
const BASE_SITE_URL =
  process.env.PUBLIC_SITE_URL || "https://express48.co.il";

// רשימת קטגוריות לזאפ
export const ZAP_CATEGORIES = [
  { key: "gaming", label: "ציוד גיימינג" },
  { key: "tools", label: "כלי עבודה" },
  { key: "home", label: "בית" },
  { key: "car", label: "רכב" },
  { key: "electrical-products", label: "מוצרי חשמל" },
  { key: "computers-and-cellphones", label: "מחשבים וסלולר" },
  { key: "cleaning", label: "ניקיון" },
  { key: "sound", label: "סאונד" },
  { key: "watches", label: "שעונים" },
];

// בריחת תווים ל-XML
function xmlEscape(str = "") {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

// קיצור טקסט
function shortText(str = "", max = 255) {
  const s = String(str).replace(/\s+/g, " ").trim();
  return s.length <= max ? s : s.slice(0, max - 1).trim() + "…";
}

/**
 * איסוף טקסט קטגוריה ממוצר – מכל השדות האפשריים.
 * אם יש אצלך שמות אחרים, תוסיפי פה.
 */
function getProductCategoryText(product) {
  const parts = [];

  if (product.category) parts.push(product.category);
  if (product.categoryName) parts.push(product.categoryName);
  if (product.categoryFullSlug) parts.push(product.categoryFullSlug);
  if (product.categorySlug) parts.push(product.categorySlug);
  if (Array.isArray(product.categories)) parts.push(...product.categories);
  if (Array.isArray(product.categoryPath)) parts.push(...product.categoryPath);

  return parts.join(" ").toLowerCase();
}

/**
 * מיפוי מוצר לבלוק XML – לפי השמות ש-ZAP ביקשו
 * product_url, product_name, shipment_cost, delivery_time וכו'
 */
function mapProductToZapXml(product) {
  const storeSlug =
    product.storeId && typeof product.storeId === "object"
      ? product.storeId.slug || product.storeId.storeSlug || "express48"
      : "express48";

  const productUrl = `${BASE_SITE_URL}/products/${storeSlug}/${product.slug}`;

  const name = shortText(product.title || "מוצר", 80);
  const model = product.model || "";
  const details = shortText(
    product.metaDescription || product.description || "",
    255
  );

  const catalogNumber = product.gtin || product.sku || "";
  const productCode = product.sku || String(product._id);

  const currency = product.currency || "ILS";
  const price =
    product.price && product.price.amount != null ? product.price.amount : 0;

  const shipmentCost =
    product.delivery && product.delivery.cost != null
      ? product.delivery.cost
      : 0;

  const deliveryTime =
    product.delivery && product.delivery.timeDays != null
      ? product.delivery.timeDays
      : 0;

  const manufacturer = product.brand || "";
  const warranty = product.warranty || "";

  const image =
    (Array.isArray(product.images) && product.images[0]) ||
    product.image ||
    "";

  return `
    <product>
      <product_url>${xmlEscape(productUrl)}</product_url>
      <product_name>${xmlEscape(name)}</product_name>
      <model>${xmlEscape(model)}</model>
      <details>${xmlEscape(details)}</details>
      <catalog_number>${xmlEscape(catalogNumber)}</catalog_number>
      <productcode>${xmlEscape(productCode)}</productcode>
      <currency>${xmlEscape(currency)}</currency>
      <price>${price}</price>
      <shipment_cost>${shipmentCost}</shipment_cost>
      <delivery_time>${deliveryTime}</delivery_time>
      <manufacturer>${xmlEscape(manufacturer)}</manufacturer>
      <warranty>${xmlEscape(warranty)}</warranty>
      <image>${xmlEscape(image)}</image>
      <tax></tax>
    </product>`;
}

function filterByZapCategory(products, categoryKey) {
  if (!categoryKey) return products;

  const key = String(categoryKey).toLowerCase();

  return products.filter((p) => {
    const categoryText = [
      p.category,            
      p.categoryName,            
      p.mainCategoryName,       
      p.categoryFullSlug,      
      Array.isArray(p.categories)
        ? p.categories.map((c) => c.name || c.slug || "").join(" ")
        : "",
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    // אם אין לנו כלום על הקטגוריה – המוצר לא יכנס לאף קטגוריית ZAP
    if (!categoryText) return false;

    switch (key) {
      case "gaming":
        return (
          categoryText.includes("גיימינג") ||
          categoryText.includes("gaming")
        );

      case "tools":
        return (
          categoryText.includes("כלי עבודה") ||
          categoryText.includes("כלים") ||
          categoryText.includes("tools")
        );

      case "home":
        return (
          categoryText.includes("בית") ||
          categoryText.includes("home")
        );

      case "car":
        return (
          categoryText.includes("רכב") ||
          categoryText.includes("car")
        );

      case "electrical-products":
        return (
          categoryText.includes("מוצרי חשמל") ||
          categoryText.includes("חשמל") ||
          categoryText.includes("electrical")
        );

      case "computers-and-cellphones":
        return (
          categoryText.includes("מחשב") ||
          categoryText.includes("מחשבים") ||
          categoryText.includes("סלולרי") ||
          categoryText.includes("טלפון") ||
          categoryText.includes("cell") ||
          categoryText.includes("phone")
        );

      case "cleaning":
        return (
          categoryText.includes("ניקיון") ||
          categoryText.includes("clean")
        );

      case "sound":
        return (
          categoryText.includes("סאונד") ||
          categoryText.includes("רמקול") ||
          categoryText.includes("אודיו") ||
          categoryText.includes("sound") ||
          categoryText.includes("audio")
        );

      case "watches":
        return (
          categoryText.includes("שעון") ||
          categoryText.includes("שעונים") ||
          categoryText.includes("watch")
        );

      default:
        return false;
    }
  });
}


/**
 * בניית פיד XML – לכל האתר או לקטגוריה
 */
export async function buildZapFeedXml({ categoryKey = null } = {}) {
  const products = await Product.find({
    isDeleted: false,
    status: "published",
    visibility: "public",
    "price.amount": { $gt: 0 },
  })
    .populate("storeId", "slug storeSlug")
    .lean();

  const filtered = filterByZapCategory(products, categoryKey);
  const itemsXml = filtered.map(mapProductToZapXml).join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<store>
  <products>
${itemsXml}
  </products>
</store>`;
}

/**
 * עמוד אינדקס – רשימת קטגוריות עם לינקים ל-XML
 */
export async function buildZapCategoryIndex() {
  const linksHtml = ZAP_CATEGORIES.map((cat) => {
    return `
      <li>
        <a href="/zap-feed.xml?category=${cat.key}">
          ${cat.label} (${cat.key})
        </a>
      </li>`;
  }).join("\n");

  return `<!DOCTYPE html>
<html lang="he" dir="rtl">
<head>
  <meta charset="utf-8" />
  <title>Express48 – ZAP Feed Categories</title>
  <style>
    body { font-family: Arial, sans-serif; max-width: 800px; margin: 40px auto; line-height: 1.6; }
    h1 { font-size: 24px; margin-bottom: 16px; }
    ul { list-style: none; padding: 0; }
    li { margin: 8px 0; }
    a { color: #0074d9; text-decoration: none; }
    a:hover { text-decoration: underline; }
    code { background:#f5f5f5; padding:2px 4px; border-radius:3px; }
  </style>
</head>
<body>
  <h1>פיד ZAP – רשימת קטגוריות</h1>
  <p>
    לחיצה על כל קטגוריה תפתח קובץ XML בפורמט של ZAP
    עם כל המוצרים השייכים לאותה קטגוריה.
  </p>
  <ul>
${linksHtml}
  </ul>

  <hr />

  <p>
    פיד כללי (כל המוצרים): <br />
    <a href="/zap-feed.xml"><code>/zap-feed.xml</code></a>
  </p>
</body>
</html>`;
}

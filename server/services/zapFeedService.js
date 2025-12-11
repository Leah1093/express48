// services/zapFeedService.js
import { Product } from "../models/Product.js";
import { Category } from "../models/Category.js";

const BASE_SITE_URL = "https://www.express48.co.il";      // אתר החנות
const BASE_API_URL =
  process.env.ZAP_BASE_API_URL || "https://api.express48.co.il"; // כתובת API לפרודקשן

// המרת טקסט לבטוח ל-XML
function xmlEscape(str = "") {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

// קיצור טקסט לאורך מקסימלי
function shortText(str = "", max = 255) {
  const s = String(str).replace(/\s+/g, " ").trim();
  return s.length <= max ? s : s.slice(0, max - 1).trim() + "…";
}

// =========================
// מיפוי מוצר בודד ל-ZAP
// =========================
function mapProductToZapXml(product) {
  // slug של החנות (shry וכו)
  const storeSlug =
    product.storeId?.slug || product.storeId?.storeSlug || "shry";

  // כתובת המוצר באתר
  const productUrl = `${BASE_SITE_URL}/products/${storeSlug}/${product.slug}`;

  const productName = shortText(product.title || "מוצר", 80);
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

  // אחריות – גם משך וגם מי נותן, כפי שביקשו
  const baseWarranty = product.warranty || "12 חודשים אחריות";
  const warrantyProvider = product.supplier || product.brand || "היבואן";
  const warranty = `${baseWarranty} ע\"י ${warrantyProvider}`;

  const image =
    (Array.isArray(product.images) && product.images[0]) ||
    product.image ||
    "";

  return `
  <product>
    <product_url>${xmlEscape(productUrl)}</product_url>
    <product_name>${xmlEscape(productName)}</product_name>
    <model>${xmlEscape(model)}</model>
    <details>${xmlEscape(details)}</details>
    <catalog_number>${xmlEscape(catalogNumber)}</catalog_number>
    <product_code>${xmlEscape(productCode)}</product_code>
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

// =========================
// פיד מוצרים (עם סינון קטגוריה אופציונלי)
// =========================
export async function buildZapFeedXml(options = {}) {
  const { categoryFullSlug = null } = options;

  const query = {
    isDeleted: false,
    status: "published",
    visibility: "public",
    "price.amount": { $gt: 0 },
  };

  if (categoryFullSlug) {
    query.categoryFullSlug = categoryFullSlug;
  }

  const products = await Product.find(query)
    .populate("storeId", "slug storeSlug")
    .lean();

  const itemsXml = products.map(mapProductToZapXml).join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<store>
  <products>
${itemsXml}
  </products>
</store>`;

  return xml;
}

// =========================
// פיד TREE של קטגוריות
// =========================
export async function buildZapCategoriesXml() {
  const categories = await Category.find({ isActive: true })
    .sort({ depth: 1, order: 1, name: 1 })
    .lean();

  const itemsXml = categories
    .map((cat) => {
      const categoryUrl = `${BASE_API_URL}/zap-feed.xml?category=${encodeURIComponent(
        cat.fullSlug
      )}`;
      return `
  <category>
    <category_name>${xmlEscape(cat.name)}</category_name>
    <category_url>${xmlEscape(categoryUrl)}</category_url>
  </category>`;
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<categories>
${itemsXml}
</categories>`;

  return xml;
}

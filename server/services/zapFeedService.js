// services/zapFeedService.js
import { Product } from "../models/Product.js";

const BASE_SITE_URL = "https://www.express48.co.il";

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

// מתרגם מוצר אחד לבלוק PRODUCT ל-ZAP
function mapProductToZapXml(product) {
  // נקבע storeSlug לפי החנות (אם יש), אחרת ברירת מחדל
  const storeSlug =
    product.storeId && typeof product.storeId === "object"
      ? product.storeId.slug || product.storeId.storeSlug || "express48"
      : "express48";

  const productSlug = product.slug;
  const url = `${BASE_SITE_URL}/products/${storeSlug}/${productSlug}`;

  const name = shortText(product.title || "מוצר", 40);
  const model = product.model || "";
  const details = shortText(
    product.metaDescription || product.description || "",
    255
  );

  const numberCatalog = product.gtin || product.sku || "";
  const productCode = product.sku || String(product._id);

  const currency = product.currency || "ILS";
  const price =
    product.price && product.price.amount != null ? product.price.amount : 0;

  const costShipment =
    product.delivery && product.delivery.cost != null
      ? product.delivery.cost
      : 0;

  const timeDelivery =
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
    <PRODUCT>
      <URL_PRODUCT>${xmlEscape(url)}</URL_PRODUCT>
      <NAME_PRODUCT>${xmlEscape(name)}</NAME_PRODUCT>
      <MODEL>${xmlEscape(model)}</MODEL>
      <DETAILS>${xmlEscape(details)}</DETAILS>
      <NUMBER_CATALOG>${xmlEscape(numberCatalog)}</NUMBER_CATALOG>
      <PRODUCTCODE>${xmlEscape(productCode)}</PRODUCTCODE>
      <CURRENCY>${xmlEscape(currency)}</CURRENCY>
      <PRICE>${price}</PRICE>
      <COST_SHIPMENT>${costShipment}</COST_SHIPMENT>
      <TIME_DELIVERY>${timeDelivery}</TIME_DELIVERY>
      <MANUFACTURER>${xmlEscape(manufacturer)}</MANUFACTURER>
      <WARRANTY>${xmlEscape(warranty)}</WARRANTY>
      <IMAGE>${xmlEscape(image)}</IMAGE>
      <TAX></TAX>
    </PRODUCT>
  `;
}

// בונה את כל הפיד ל-ZAP
export async function buildZapFeedXml() {
  const products = await Product.find({
    isDeleted: false,
    status: "published",
    visibility: "public",
    "price.amount": { $gt: 0 },
  })
    // חשוב: לוודא שבמודל Store יש שדה slug או storeSlug
    .populate("storeId", "slug storeSlug")
    .lean();

  const itemsXml = products.map(mapProductToZapXml).join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<STORE>
  <PRODUCTS>
${itemsXml}
  </PRODUCTS>
</STORE>`;

  return xml;
}

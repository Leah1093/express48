// src/services/zapFeed.service.js
import { Product } from "../models/Product.js";

function xmlEscape(str = "") {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function shortText(str = "", max = 255) {
  const s = String(str).replace(/\s+/g, " ").trim();
  return s.length <= max ? s : s.slice(0, max - 1).trim() + "…";
}

// מתרגם מוצר אחד לבלוק של PRODUCT
function mapProductToZapXml(product) {
  const url = `https://www.express48.co.il/product/${product.slug}`;

  const name = shortText(product.title || "מוצר", 40);
  const model = product.model || "";
  const details =
    shortText(product.metaDescription || product.description || "", 255);

  const numberCatalog = product.gtin || product.sku || "";
  const productCode = product.sku || String(product._id);

  const currency = product.currency || "ILS";
  const price = product.price?.amount != null ? product.price.amount : 0;

  const costShipment =
    product.delivery?.cost != null ? product.delivery.cost : 0;

  const timeDelivery =
    product.delivery?.timeDays != null ? product.delivery.timeDays : 0;

  const manufacturer = product.brand || "";
  const warranty = product.warranty || "";

  const image =
    (product.images && product.images[0]) || product.image || "";

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

// בונה את כל הפיד
export async function buildZapFeedXml() {
  const products = await Product.find({
    isDeleted: false,
    "price.amount": { $gt: 0 },
  }).lean();

  const itemsXml = products.map(mapProductToZapXml).join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<STORE>
  <PRODUCTS>
${itemsXml}
  </PRODUCTS>
</STORE>`;

  return xml;
}

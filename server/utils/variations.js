/**
 * Variations Utility Functions - Shared Logic for Client & Server
 * These functions are critical for maintaining consistency between frontend and backend
 */

/**
 * Generate canonical signature from variation attributes
 * Used for duplicate detection (order-independent comparison)
 * MUST be identical on both client and server
 * 
 * @param {Record<string, string>} attributes - key-value pairs of attributes
 * @returns {string} - signature like "color=red|size=L"
 */
function getVariationSignature(attributes) {
  if (!attributes || typeof attributes !== "object") return "";
  return Object.keys(attributes)
    .sort()
    .map((key) => `${key}=${attributes[key]}`)
    .join("|");
}

/**
 * Generate variation SKU from base SKU and attributes
 * Handles Hebrew characters properly, max 64 chars
 * MUST be identical on both client and server
 * 
 * @param {string} baseSku - base product SKU (e.g., "SHIRT-001")
 * @param {Record<string, string>} attributes - variation attributes
 * @returns {string} - generated SKU (e.g., "SHIRT-001-red-L")
 */
function generateVariationSku(baseSku, attributes) {
  const sortedKeys = Object.keys(attributes || {}).sort();
  
  // Use same regex on both client and server: preserve Hebrew + alphanumeric + hyphen
  const valueParts = sortedKeys
    .map((key) =>
      String(attributes[key])
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^\w\u0590-\u05FF-]/g, "") // Preserve Hebrew: \u0590-\u05FF
    )
    .filter((v) => v.length > 0);

  const combined = [baseSku, ...valueParts]
    .filter((v) => v && v.length > 0)
    .join("-");

  return combined.slice(0, 64);
}

/**
 * Calculate variation price based on variationsConfig
 * This is the canonical price calculation used by both client and server
 * 
 * @param {Object} params
 * @param {number} params.basePrice - product's base price
 * @param {string} params.priceRule - "sum" or "max" (default: "sum")
 * @param {Record<string, string>} params.attributes - variation attributes
 * @param {Object} params.variationsConfig - config with attributes and terms
 * @returns {number} - final price for the variation
 */
function calculateVariationPrice({
  basePrice = 0,
  priceRule = "sum",
  attributes = {},
  variationsConfig,
}) {
  // If no config or no attributes, return base price
  if (!variationsConfig?.attributes || variationsConfig.attributes.length === 0) {
    return basePrice;
  }

  if (!attributes || Object.keys(attributes).length === 0) {
    return basePrice;
  }

  const applicablePrices = [];
  let hasOverride = false;
  let overridePrice = 0;

  // Iterate through config attributes to find matching terms
  for (const attr of variationsConfig.attributes) {
    const attrName = attr.name;
    const attrValue = attributes[attrName];

    // Skip if variation doesn't have this attribute
    if (!attrValue || !attr.terms) continue;

    // Find matching term by label
    const matchingTerm = attr.terms.find((t) => t.label === attrValue);

    if (!matchingTerm) continue;

    // Handle different price types
    if (matchingTerm.priceType === "override") {
      // Override: take the highest override (if multiple overrides)
      hasOverride = true;
      overridePrice = Math.max(overridePrice, matchingTerm.price || 0);
    } else if (matchingTerm.priceType === "addon") {
      // Addon: accumulate based on priceRule
      applicablePrices.push(matchingTerm.price || 0);
    }
    // priceType === "none": no price change
  }

  // Return final price based on logic
  if (hasOverride) {
    // Override always takes precedence
    return overridePrice;
  }

  if (applicablePrices.length === 0) {
    // No addons, no overrides: return base price
    return basePrice;
  }

  // Apply addons based on priceRule
  const addonTotal =
    priceRule === "max"
      ? Math.max(...applicablePrices)
      : applicablePrices.reduce((a, b) => a + b, 0);

  return basePrice + addonTotal;
}

/**
 * Generate a random term ID (18-char hex)
 * Used when creating new terms
 * 
 * @returns {string} - random hex ID
 */
function generateTermId() {
  // Client: use crypto.getRandomValues for secure random
  // Server: use crypto.randomBytes for secure random
  if (typeof crypto !== "undefined" && crypto.getRandomValues) {
    const bytes = new Uint8Array(9);
    crypto.getRandomValues(bytes);
    return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
  }
  // Fallback for environments without crypto
  return Math.random().toString(36).substr(2, 18);
}

export {
  getVariationSignature,
  generateVariationSku,
  calculateVariationPrice,
  generateTermId,
};

import crypto from "crypto";
import mongoose from "mongoose";
import { CustomError } from "../utils/CustomError.js";
import { Product } from "../models/Product.js";
import { Category } from "../models/category.js";
import { generateTermId, generateVariationSku, getVariationSignature } from "../utils/variations.js";

// ---------- helpers ----------
const sortMap = {
  "-updatedAt": { updatedAt: -1 },
  updatedAt: { updatedAt: 1 },
  title: { title: 1 },
  brand: { brand: 1 },
  price: { "price.amount": 1 },
  "+price": { "price.amount": 1 },
  "-price": { "price.amount": -1 },
  stock: { stock: 1 },
  "-stock": { stock: -1 },
};

const PREVIEW_PROJECTION = {
  title: 1,
  brand: 1,
  category: 1,
  sku: 1,
  gtin: 1,
  "price.amount": 1,
  stock: 1,
  status: 1,
  updatedAt: 1,
  images: 1,
  "discount.discountType": 1,
  "discount.discountValue": 1,
  "discount.expiresAt": 1,
  "variations._id": 1,
  isDeleted: 1,
};

const ALLOWED = {
  draft: ["published"],
  published: ["suspended"],
  suspended: ["published"],
};

const FINAL_MAP = { ך: "כ", ם: "מ", ן: "נ", ף: "פ", ץ: "צ" };

function normalizeHebrew(str = "") {
  let s = String(str)
    .replace(/[\u0591-\u05C7]/g, "")
    .replace(/[\u05F3\u05F4'\"]/g, "")
    .replace(/[^\u0590-\u05FF0-9A-Za-z\s-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  s = s.replace(/[ךםןףץ]/g, (ch) => FINAL_MAP[ch] || ch);
  return s.toLowerCase();
}

function escapeRegex(s) {
  return String(s).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function makeETag(doc) {
  const base = `${doc._id}-${doc.__v}-${
    doc.updatedAt?.getTime?.() || Date.now()
  }`;
  return `W/"${crypto.createHash("sha1").update(base).digest("hex")}"`;
}

function generateETag(obj) {
  return crypto.createHash("sha1").update(JSON.stringify(obj)).digest("hex");
}

function toNum(v) {
  if (v === undefined || v === null || v === "") return undefined;
  const n = Number(v);
  return Number.isFinite(n) ? n : undefined;
}

function toDate(v) {
  if (!v) return undefined;
  const d = new Date(v);
  return Number.isFinite(d.getTime()) ? d : undefined;
}

function assertObjectId(id, name = "id") {
  if (!mongoose.isValidObjectId(id)) {
    throw new CustomError(`Invalid ${name}`, 400);
  }
}

function parseDeletedFlag(flag = "active") {
  const f = String(flag).toLowerCase();
  return ["active", "deleted", "all"].includes(f) ? f : "active";
}

// Variation helpers are now imported from ../utils/variations.js

// ---------- service ----------
export class SellerProductsService {
  async list({ sellerId, storeId, role, query }) {
    if (!query || typeof query !== "object") {
      throw new CustomError("Invalid query", 400);
    }

    const {
      page,
      limit,
      sort,
      search,
      status,
      category,
      brand,
      priceMin,
      priceMax,
      stockMin,
      stockMax,
      updatedFrom,
      updatedTo,
      fields,
      deleted = "active",
    } = query;

    const p = Math.max(1, Number(page) || 1);
    const l = Math.max(1, Number(limit) || 20);
    const skip = (p - 1) * l;

    const match = {};

    if (role !== "admin") {
  if (sellerId && mongoose.isValidObjectId(sellerId)) {
    match.sellerId = new mongoose.Types.ObjectId(String(sellerId));
  }

  // אם תרצי בעמוד של הסלר פילטר לפי חנות ספציפית (dropdown) – זה מאפשר:
  if (query.storeId && mongoose.isValidObjectId(query.storeId)) {
    match.storeId = new mongoose.Types.ObjectId(String(query.storeId));
  }
} else {
  // לאדמין – נשאיר את ההתנהגות הקיימת
  if (storeId && mongoose.isValidObjectId(storeId)) {
    match.storeId = new mongoose.Types.ObjectId(String(storeId));
  } else if (query.storeId && mongoose.isValidObjectId(query.storeId)) {
    match.storeId = new mongoose.Types.ObjectId(String(query.storeId));
  }
}


    const deletedMode = parseDeletedFlag(deleted);
    if (deletedMode === "active") match.isDeleted = false;
    else if (deletedMode === "deleted") match.isDeleted = true;

    if (status) match.status = status;
    if (category) match.category = category;
    if (brand) match.brand = brand;

    const pMin = toNum(priceMin);
    const pMax = toNum(priceMax);
    if (pMin !== undefined || pMax !== undefined) {
      match["price.amount"] = {};
      if (pMin !== undefined) match["price.amount"].$gte = pMin;
      if (pMax !== undefined) match["price.amount"].$lte = pMax;
    }

    const sMin = toNum(stockMin);
    const sMax = toNum(stockMax);
    if (sMin !== undefined || sMax !== undefined) {
      match.stock = {};
      if (sMin !== undefined) match.stock.$gte = sMin;
      if (sMax !== undefined) match.stock.$lte = sMax;
    }

    const dFrom = toDate(updatedFrom);
    const dTo = toDate(updatedTo);
    if (dFrom || dTo) {
      match.updatedAt = {};
      if (dFrom) match.updatedAt.$gte = dFrom;
      if (dTo) match.updatedAt.$lte = dTo;
    }

    if (search && String(search).trim()) {
      const q = escapeRegex(String(search).trim());
      const qHe = normalizeHebrew(String(search).trim());
      match.$or = [
        { title: new RegExp(q, "i") },
        { brand: new RegExp(q, "i") },
        { model: new RegExp(q, "i") },
        { sku: new RegExp(q, "i") },
        { gtin: String(search).trim() },
        { "variations.sku": new RegExp(q, "i") },
        { "variations.gtin": String(search).trim() },
        { title_he_plain: new RegExp(escapeRegex(qHe), "i") },
        { brand_he_plain: new RegExp(escapeRegex(qHe), "i") },
        { model_he_plain: new RegExp(escapeRegex(qHe), "i") },
        { description_he_plain: new RegExp(escapeRegex(qHe), "i") },
      ];
    }

    let projection = PREVIEW_PROJECTION;
    if (fields) {
      projection = String(fields)
        .split(",")
        .reduce((acc, key) => {
          const k = key.trim();
          if (k) acc[k] = 1;
          return acc;
        }, {});
      if (!projection["variations._id"]) projection["variations._id"] = 1;
      if (!projection.images) projection.images = 1;
    }

    const sortObj = sortMap[sort] || sortMap["-updatedAt"];

    const [res] = await Product.aggregate([
      { $match: match },
      { $sort: sortObj },
      {
        $facet: {
          items: [{ $skip: skip }, { $limit: l }, { $project: projection }],
          meta: [{ $count: "total" }],
        },
      },
      {
        $project: {
          items: 1,
          total: { $ifNull: [{ $arrayElemAt: ["$meta.total", 0] }, 0] },
        },
      },
    ]).allowDiskUse(true);

    const rawItems = res?.items || [];
    const total = res?.total || 0;

    const items = rawItems.map((doc) => {
      const hasVariations =
        Array.isArray(doc.variations) && doc.variations.length > 0;
      const thumbnailUrl =
        Array.isArray(doc.images) && doc.images.length ? doc.images[0] : null;
      return { ...doc, hasVariations, thumbnailUrl };
    });

    return {
      items,
      page: p,
      limit: l,
      total,
      hasNextPage: skip + items.length < total,
    };
  }

  async getOne({ id, sellerId, storeId, role }) {
    assertObjectId(id, "product id");

    const productDoc = await Product.findById(id)
      .setOptions({ includeDeleted: true })
      .lean();

    if (!productDoc) throw new CustomError("Product not found", 404);

    if (role !== "admin") {
      const sameSeller =
        productDoc.sellerId && String(productDoc.sellerId) === String(sellerId);
      const sameStore =
        productDoc.storeId && String(productDoc.storeId) === String(storeId);
      if (!sameSeller || !sameStore) {
        throw new CustomError("Forbidden: product is not yours", 403);
      }
    }

    // Log what's being returned to the frontend
    console.log("📤 getOne - Returning product to frontend:", {
      _id: productDoc._id,
      hasInventory: !!productDoc.inventory,
      inventory: productDoc.inventory,
      hasShipping: !!productDoc.shipping,
      shipping: productDoc.shipping,
      hasDelivery: !!productDoc.delivery,
      delivery: productDoc.delivery,
      hasDiscount: !!productDoc.discount,
      discount: productDoc.discount,
      hasSEO: !!(productDoc.metaTitle || productDoc.metaDescription || productDoc.slug),
      seo: { metaTitle: productDoc.metaTitle, metaDescription: productDoc.metaDescription, slug: productDoc.slug },
      hasManufacturerCode: !!productDoc.manufacturerCode,
      manufacturerCode: productDoc.manufacturerCode,
      visibility: productDoc.visibility,
    });

    // >>> כאן מוסיפים את ה-blocks תמיד לפני ההחזרה
    if (productDoc.overview) {
      productDoc.overview.blocks = Product.buildOverviewBlocksFromLegacy(
        productDoc.overview
      );
    }

    const etag = generateETag(productDoc);
    return { product: productDoc, etag };
  }

  async update({ id, sellerId, storeId, role, data, ifMatch }) {
    assertObjectId(id, "product id");

    const doc = await Product.findById(id);
    if (!doc) throw new CustomError("Product not found", 404);

    if (role === "seller") {
      if (!storeId || String(doc.storeId) !== String(storeId)) {
        throw new CustomError("Forbidden: product is not yours", 403);
      }
    }

    const currentETag = makeETag(doc);
    if (ifMatch && ifMatch !== currentETag) {
      throw new CustomError("Precondition Failed", 412);
    }

    const { categoryId, ...rest } = data || {};
    let payload = { ...rest };
    let patch = { ...rest };

    // Check if main product SKU is being changed
    if (rest.sku && rest.sku !== doc.sku) {
      await this.assertSkuUnique(rest.sku, doc.storeId, null, doc._id);
    }

    // ========== NEW: VARIATIONS CONFIG & SYNC ==========
    if (rest.variationsConfig || rest.variations) {
      const processed = await this.processVariationsData({
        variationsConfig: rest.variationsConfig,
        variations: rest.variations,
        existingProduct: doc,
        baseSku: rest.sku || doc.sku,
        storeId: doc.storeId,
      });

      patch.variationsConfig = processed.variationsConfig;
      patch.variations = processed.variations;
    }
    // ================================================

    // אם שולחים categoryId חדש, נעדכן ממנו את כל שדות הקטגוריה
    if (categoryId) {
      const merged = {
        ...doc.toObject(),
        ...rest,
      };
      const withCategory = await this.applyCategoryToProductPayload(
        merged,
        categoryId
      );

      // נשמור רק את השדות שעברו שינוי לעדכון
      patch = {
        ...patch,
        primaryCategoryId: withCategory.primaryCategoryId,
        categoryFullSlug: withCategory.categoryFullSlug,
        categoryPathIds: withCategory.categoryPathIds,
        breadcrumbs: withCategory.breadcrumbs,
        category: withCategory.category,
        subCategory: withCategory.subCategory,
      };
    }

    Object.assign(doc, patch);

    await doc.save();
    const etag = makeETag(doc);
    const updated = doc.toObject({ virtuals: true });
    return { updated, etag };
  }
  async createProduct({ data, actor }) {
    try {
      const { categoryId, ...rest } = data;

      let payload = {
        ...rest,
        createdBy: actor?.id,
        updatedBy: actor?.id,
      };

      // DEBUG: Log incoming data
      console.log("📥 createProduct - Incoming data structure:", {
        hasInventory: !!payload.inventory,
        inventory: payload.inventory,
        hasShipping: !!payload.shipping,
        shipping: payload.shipping,
        hasDelivery: !!payload.delivery,
        delivery: payload.delivery,
        hasDiscount: !!payload.discount,
        discount: payload.discount,
        hasSEO: !!(payload.metaTitle || payload.metaDescription || payload.slug),
        seo: { metaTitle: payload.metaTitle, metaDescription: payload.metaDescription, slug: payload.slug },
        hasManufacturerCode: !!payload.manufacturerCode,
        manufacturerCode: payload.manufacturerCode,
      });

      // ========== NEW: VARIATIONS CONFIG & SYNC ==========
      if (payload.variationsConfig || payload.variations) {
        const processed = await this.processVariationsData({
          variationsConfig: payload.variationsConfig,
          variations: payload.variations,
          existingProduct: {},
          baseSku: payload.sku,
          storeId: payload.storeId,
        });

        payload.variationsConfig = processed.variationsConfig;
        payload.variations = processed.variations;
      }
      // ================================================

      if (categoryId) {
        payload = await this.applyCategoryToProductPayload(payload, categoryId);
      }

      // לא לשמור categoryId במודל עצמו
      const doc = new Product(payload);
      const saved = await doc.save();
      return saved;
    } catch (err) {
      if (err?.code === 11000) {
        // נשאיר את הטיפול בדופליקייט כמו שכתבת
        console.error("🔥 DUPLICATE KEY ERROR in createProduct:", {
          code: err.code,
          keyPattern: err.keyPattern,
          keyValue: err.keyValue,
          message: err.message,
        });

        const pattern = err.keyPattern || {};
        const value = err.keyValue || {};
        const keys = Object.keys(pattern);
        const field = keys.length ? keys.join("+") : "unknown";

        const details = keys.map((k) => `${k}=${value[k]}`).join(", ");

        const msg = details
          ? `Duplicate ${field} (${details})`
          : `Duplicate ${field}`;

        throw new CustomError(msg, 409);
      }

      if (err?.name === "ValidationError") {
        throw new CustomError(err.message || "Validation error", 400);
      }

      throw err;
    }
  }

  async softDelete(productId, userId) {
    assertObjectId(productId, "product id");
    return Product.findByIdAndUpdate(
      productId,
      { $set: { isDeleted: true, deletedAt: new Date(), deletedBy: userId } },
      { new: true }
    );
  }

  async restore(productId, userId) {
    assertObjectId(productId, "product id");
    return Product.findByIdAndUpdate(
      productId,
      {
        $set: {
          isDeleted: false,
          deletedAt: null,
          deletedBy: null,
          restoredAt: new Date(),
          restoredBy: userId,
        },
      },
      { new: true, includeDeleted: true }
    );
  }

  async updateStatus({ id, nextStatus, actorId, role, sellerId }) {
    assertObjectId(id, "product id");

    const query = { _id: new mongoose.Types.ObjectId(id) };
    const opts = { includeDeleted: true };

    const product = await Product.findOne(query, null, opts);
    if (!product) throw new CustomError("Product not found", 404);

    if (role !== "admin") {
      const pSeller = String(product.sellerId || "");
      const reqSeller = String(sellerId || "");
      if (!pSeller || !reqSeller || pSeller !== reqSeller) {
        throw new CustomError("Forbidden: product is not yours", 403);
      }
    }

    const current = product.status;
    const allowedNext = ALLOWED[current] || [];
    if (!allowedNext.includes(nextStatus)) {
      throw new CustomError(
        `Transition ${current} -> ${nextStatus} is not allowed`,
        409
      );
    }

    product.status = nextStatus;
    product.updatedAt = new Date();
    if (!Array.isArray(product.statusHistory)) product.statusHistory = [];
    product.statusHistory.push({
      from: current,
      to: nextStatus,
      at: new Date(),
      by: actorId,
    });

    await product.save();
    return product.toObject();
  }
  async applyCategoryToProductPayload(payload, categoryId) {
    if (!categoryId) {
      return payload;
    }

    const category = await Category.findById(categoryId).lean();
    if (!category) {
      throw new CustomError("Category not found", 400);
    }

    // מסלול ה־ObjectId מקטגורית שורש עד הקטגוריה שנבחרה
    const pathIds = [...(category.ancestors || []), category._id];

    const pathCategories = await Category.find({ _id: { $in: pathIds } })
      .sort({ depth: 1, order: 1, name: 1 })
      .lean();

    const root = pathCategories[0];
    const sub = pathCategories[1];

    return {
      ...payload,

      // קישור חזק לעץ הקטגוריות
      primaryCategoryId: category._id,
      categoryFullSlug: category.fullSlug,
      categoryPathIds: pathIds,

      // לשימוש פשוט בפרונט / פילטרים
      category: root?.name || "",
      subCategory: sub?.name || "",

      // פירורי לחם מסודרים
      breadcrumbs: pathCategories.map((c) => ({
        id: c._id,
        name: c.name,
        slug: c.slug,
        fullSlug: c.fullSlug,
        depth: c.depth,
      })),
    };
  }

  // ========== VARIATIONS METHODS ==========

  /**
   * Check SKU uniqueness within store
   */
  async assertSkuUnique(sku, storeId, excludeVariationId = null, excludeProductId = null) {
    if (!sku || !storeId) return;

    const query = {
      storeId: new mongoose.Types.ObjectId(String(storeId)),
      isDeleted: false,
      $or: [{ sku: sku }, { "variations.sku": sku }],
    };

    // Exclude the current product being updated
    if (excludeProductId) {
      query._id = { $ne: new mongoose.Types.ObjectId(String(excludeProductId)) };
    }

    const existing = await Product.findOne(query);
    if (existing) {
      // Check if it's the current variation being updated
      if (excludeVariationId) {
        const isCurrentVariation = existing.variations?.some(
          (v) =>
            v._id?.toString() === excludeVariationId && v.sku === sku
        );
        if (isCurrentVariation) return;
      }
      throw new CustomError(`SKU "${sku}" already exists in this store`, 409);
    }
  }

  /**
   * Ensure variationsConfig structure is valid
   */
  syncVariationsConfig(config) {
    if (!config) return { priceRule: "base", attributes: [] };

    const attributes = (config.attributes || []).map((attr) => ({
      name: attr.name || "",
      displayName: attr.displayName || attr.name || "",
      terms: (attr.terms || []).map((term) => ({
        id: term.id || generateTermId(),
        label: term.label || "",
        priceType:
          ["none", "addon", "override"].includes(term.priceType) ?
          term.priceType :
          "none",
        price: term.price ?? null,
        images: Array.isArray(term.images) ? term.images : [],
      })),
    }));

    return {
      priceRule: config.priceRule || "base",
      attributes,
    };
  }

  /**
   * Apply term pricing/images to variation if matching
   */
  applyConfigPricingToVariation({ variationData, config }) {
    const variation = { ...variationData };

    // Find matching terms and apply overrides
    for (const attr of config.attributes || []) {
      const varAttrValue = variation.attributes?.[attr.name];

      const matchingTerm = attr.terms?.find((t) => t.label === varAttrValue);

      if (matchingTerm) {
        // 1. Apply price override if set
        if (
          matchingTerm.priceType === "override" &&
          typeof matchingTerm.price === "number"
        ) {
          variation.price = {
            amount: matchingTerm.price,
          };
        }

        // 2. Merge images from term (don't overwrite)
        if (matchingTerm.images?.length > 0) {
          const existing = new Set(variation.images || []);
          matchingTerm.images.forEach((img) => existing.add(img));
          variation.images = Array.from(existing);
        }
      }
    }

    return variation;
  }

  /**
   * Main processor: sync variations config & auto-update variations
   */
  async processVariationsData({
    variationsConfig,
    variations,
    existingProduct,
    baseSku,
    storeId,
  }) {
    // 1. Sync variationsConfig structure
    let syncedConfig = this.syncVariationsConfig(variationsConfig);

    // 2. Get valid attribute names from config
    let validAttrNames = new Set(
      (syncedConfig.attributes || []).map((attr) => attr.name)
    );

    // 3. Discover any attributes in variations that aren't in config (new types added in edit)
    if (variations && Array.isArray(variations)) {
      for (const varData of variations) {
        const varAttrs = varData.attributes || {};
        for (const attrName of Object.keys(varAttrs)) {
          if (!validAttrNames.has(attrName)) {
            console.log(`Adding new variation attribute to config: ${attrName}`);
            syncedConfig.attributes.push({
              name: attrName,
              displayName: attrName,
              terms: [],
            });
            validAttrNames.add(attrName);
          }
        }
      }
    }

    // 4. Process variations array
    const processedVariations = [];
    const usedSignatures = new Set();

    if (variations && Array.isArray(variations)) {
      for (const varData of variations) {
        // 4a. Clean orphaned attributes (not in config)
        const cleanedAttrs = {};
        const originalAttrs = varData.attributes || {};

        for (const [attrName, attrValue] of Object.entries(originalAttrs)) {
          if (validAttrNames.has(attrName)) {
            cleanedAttrs[attrName] = attrValue;
          } else {
            console.warn(
              `Removed orphaned variation attribute: ${attrName}="${attrValue}" ` +
              `(not found in config)`
            );
          }
        }

        // 4b. Skip empty variations (all attributes were orphaned)
        if (Object.keys(cleanedAttrs).length === 0) {
          console.warn(
            `Skipping variation with no valid attributes - variation ID: ${varData._id}`
          );
          continue; // Skip this variation
        }

        // 4c. Check for duplicates
        const signature = getVariationSignature(cleanedAttrs);

        if (usedSignatures.has(signature)) {
          console.warn(`Duplicate variation signature ignored: ${signature}`);
          continue; // Skip duplicate
        }

        usedSignatures.add(signature);

        // Update varData with cleaned attributes for further processing
        varData.attributes = cleanedAttrs;

        // 4d. Handle SKU
        let sku = varData.sku;

        if (!sku || sku.trim() === "") {
          // Auto-generate if empty
          sku = generateVariationSku(baseSku, varData.attributes || {});
        }

        // 4e. Check uniqueness (only for new or modified SKUs)
        const existingVar = existingProduct?.variations?.find(
          (v) => v._id?.toString() === varData._id
        );

        if (!existingVar || existingVar.sku !== sku) {
          await this.assertSkuUnique(sku, storeId, varData._id, existingProduct?._id);
        }

        // 4f. Apply pricing from config to variation
        const processed = this.applyConfigPricingToVariation({
          variationData: varData,
          config: syncedConfig,
        });

        processed.sku = sku;
        processedVariations.push(processed);
      }
    }

    return {
      variationsConfig: syncedConfig,
      variations: processedVariations,
    };
  }
}

// ---------- test hooks ----------
export const __testables = {
  sortMap,
  PREVIEW_PROJECTION,
  ALLOWED,
  FINAL_MAP,
  normalizeHebrew,
  escapeRegex,
  makeETag,
  generateETag,
  toNum,
  toDate,
  parseDeletedFlag,
  assertObjectId,
  getVariationSignature,
  generateVariationSku,
  generateTermId,
};

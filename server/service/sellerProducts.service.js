// FILE: server/service/sellerProducts.service.js
import crypto from "crypto";
import mongoose from "mongoose";
import { CustomError } from "../utils/CustomError.js";
import { Product } from "../models/Product.js";

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
  s = s.replace(/[ךםןףץ]/g, ch => FINAL_MAP[ch] || ch);
  return s.toLowerCase();
}

function escapeRegex(s) { return String(s).replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); }

function makeETag(doc) {
  const base = `${doc._id}-${doc.__v}-${doc.updatedAt?.getTime?.() || Date.now()}`;
  return `W/"${crypto.createHash("sha1").update(base).digest("hex")}"`;
}

function generateETag(obj) { return crypto.createHash("sha1").update(JSON.stringify(obj)).digest("hex"); }

function toNum(v) { if (v === undefined || v === null || v === "") return undefined; const n = Number(v); return Number.isFinite(n) ? n : undefined; }

function toDate(v) { if (!v) return undefined; const d = new Date(v); return Number.isFinite(d.getTime()) ? d : undefined; }

function assertObjectId(id, name = "id") { if (!mongoose.isValidObjectId(id)) { throw new CustomError(`Invalid ${name}`, 400); } }

function parseDeletedFlag(flag = "active") { const f = String(flag).toLowerCase(); return ["active", "deleted", "all"].includes(f) ? f : "active"; }

// ---------- service ----------
export class SellerProductsService {
  async list({ sellerId, storeId, role, query }) {
    if (!query || typeof query !== "object") { throw new CustomError("Invalid query", 400); }

    const { page, limit, sort, search, status, category, brand, priceMin, priceMax, stockMin, stockMax, updatedFrom, updatedTo, fields, deleted = "active" } = query;

    const p = Math.max(1, Number(page) || 1);
    const l = Math.max(1, Number(limit) || 20);
    const skip = (p - 1) * l;

    const match = {};

    if (role !== "admin" && sellerId && mongoose.isValidObjectId(sellerId)) {
      match.sellerId = new mongoose.Types.ObjectId(String(sellerId));
    }

    if (storeId && mongoose.isValidObjectId(storeId)) {
      match.storeId = new mongoose.Types.ObjectId(String(storeId));
    } else if (query.storeId && mongoose.isValidObjectId(query.storeId)) {
      match.storeId = new mongoose.Types.ObjectId(String(query.storeId));
    }

    const deletedMode = parseDeletedFlag(deleted);
    if (deletedMode === "active") match.isDeleted = false; else if (deletedMode === "deleted") match.isDeleted = true;

    if (status) match.status = status;
    if (category) match.category = category;
    if (brand) match.brand = brand;

    const pMin = toNum(priceMin); const pMax = toNum(priceMax);
    if (pMin !== undefined || pMax !== undefined) { match["price.amount"] = {}; if (pMin !== undefined) match["price.amount"].$gte = pMin; if (pMax !== undefined) match["price.amount"].$lte = pMax; }

    const sMin = toNum(stockMin); const sMax = toNum(stockMax);
    if (sMin !== undefined || sMax !== undefined) { match.stock = {}; if (sMin !== undefined) match.stock.$gte = sMin; if (sMax !== undefined) match.stock.$lte = sMax; }

    const dFrom = toDate(updatedFrom); const dTo = toDate(updatedTo);
    if (dFrom || dTo) { match.updatedAt = {}; if (dFrom) match.updatedAt.$gte = dFrom; if (dTo) match.updatedAt.$lte = dTo; }

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
      projection = String(fields).split(",").reduce((acc, key) => { const k = key.trim(); if (k) acc[k] = 1; return acc; }, {});
      if (!projection["variations._id"]) projection["variations._id"] = 1;
      if (!projection.images) projection.images = 1;
    }

    const sortObj = sortMap[sort] || sortMap["-updatedAt"];

    const [res] = await Product.aggregate([
      { $match: match },
      { $sort: sortObj },
      { $facet: { items: [{ $skip: skip }, { $limit: l }, { $project: projection }], meta: [{ $count: "total" }] } },
      { $project: { items: 1, total: { $ifNull: [{ $arrayElemAt: ["$meta.total", 0] }, 0] } } },
    ]).allowDiskUse(true);

    const rawItems = res?.items || []; const total = res?.total || 0;

    const items = rawItems.map(doc => {
      const hasVariations = Array.isArray(doc.variations) && doc.variations.length > 0;
      const thumbnailUrl = Array.isArray(doc.images) && doc.images.length ? doc.images[0] : null;
      return { ...doc, hasVariations, thumbnailUrl };
    });

    return { items, page: p, limit: l, total, hasNextPage: skip + items.length < total };
  }

  async getOne({ id, sellerId, storeId, role }) {
    assertObjectId(id, "product id");

    const product = await Product.findById(id).setOptions({ includeDeleted: true }).lean();
    if (!product) throw new CustomError("Product not found", 404);

    if (role !== "admin") {
      const sameSeller = product.sellerId && String(product.sellerId) === String(sellerId);
      const sameStore = product.storeId && String(product.storeId) === String(storeId);
      if (!sameSeller || !sameStore) { throw new CustomError("Forbidden: product is not yours", 403); }
    }

    const etag = generateETag(product);
    return { product, etag };
  }

  async update({ id, sellerId, storeId, role, data, ifMatch }) {
    assertObjectId(id, "product id");

    const doc = await Product.findById(id);
    if (!doc) throw new CustomError("Product not found", 404);

    if (role === "seller") {
      if (!storeId || String(doc.storeId) !== String(storeId)) { throw new CustomError("Forbidden: product is not yours", 403); }
    }

    const currentETag = makeETag(doc);
    if (ifMatch && ifMatch !== currentETag) { throw new CustomError("Precondition Failed", 412); }

    Object.assign(doc, data);

    await doc.save();
    const etag = makeETag(doc);
    const updated = doc.toObject({ virtuals: true });
    return { updated, etag };
  }

  async createProduct({ data, actor }) {
    try {
      const payload = { ...data, createdBy: actor?.id, updatedBy: actor?.id };
      const doc = new Product(payload);
      const saved = await doc.save();
      return saved;
    } catch (err) {
      if (err?.code === 11000) {
        const field = Object.keys(err.keyValue || err.keyPattern || {})[0] || "uniqueField";
        throw new CustomError(`Duplicate ${field}`, 409);
      }
      if (err?.name === "ValidationError") { throw new CustomError(err.message || "Validation error", 400); }
      throw err; // unknown
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
      { $set: { isDeleted: false, deletedAt: null, deletedBy: null, restoredAt: new Date(), restoredBy: userId } },
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
      if (!pSeller || !reqSeller || pSeller !== reqSeller) { throw new CustomError("Forbidden: product is not yours", 403); }
    }

    const current = product.status;
    const allowedNext = ALLOWED[current] || [];
    if (!allowedNext.includes(nextStatus)) { throw new CustomError(`Transition ${current} -> ${nextStatus} is not allowed`, 409); }

    product.status = nextStatus;
    product.updatedAt = new Date();
    if (!Array.isArray(product.statusHistory)) product.statusHistory = [];
    product.statusHistory.push({ from: current, to: nextStatus, at: new Date(), by: actorId });

    await product.save();
    return product.toObject();
  }
}

// ---------- test hooks ----------
export const __testables = { sortMap, PREVIEW_PROJECTION, ALLOWED, FINAL_MAP, normalizeHebrew, escapeRegex, makeETag, generateETag, toNum, toDate, parseDeletedFlag, assertObjectId };



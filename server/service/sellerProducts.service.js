import crypto from "crypto";
import { Product } from "../models/Product.js";
import mongoose from "mongoose";

// מיפוי מיון
const sortMap = {
    "-updatedAt": { updatedAt: -1 },
    "updatedAt": { updatedAt: 1 },
    "title": { title: 1 },
    "brand": { brand: 1 },
    "price": { "price.amount": 1 },
    "+price": { "price.amount": 1 },
    "-price": { "price.amount": -1 },
    "stock": { stock: 1 },
    "-stock": { stock: -1 }
};
function makeETag(doc) {
    // חלש אך שימושי: על בסיס updatedAt+__v+_id
    const base = `${doc._id}-${doc.__v}-${doc.updatedAt?.getTime?.() || Date.now()}`;
    return `W/"${crypto.createHash("sha1").update(base).digest("hex")}"`;
}
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
    isDeleted: 1, // ← חשוב לרנדר בצד הלקוח
};
// מיפוי מעברים מותרים (אם תרצי להרשות גם draft→suspended הוסיפי לרשימה)
const ALLOWED = {
    draft: ["published"],
    published: ["suspended"],
    suspended: ["published"],
};
const FINAL_MAP = { "ך": "כ", "ם": "מ", "ן": "נ", "ף": "פ", "ץ": "צ" };
function normalizeHebrew(str = "") {
    let s = String(str)
        .replace(/[\u0591-\u05C7]/g, "")
        .replace(/[\u05F3\u05F4'"]/g, "")
        .replace(/[^\u0590-\u05FF0-9A-Za-z\s-]/g, " ")
        .replace(/\s+/g, " ")
        .trim();
    s = s.replace(/[ךםןףץ]/g, ch => FINAL_MAP[ch] || ch);
    return s.toLowerCase();
}
function escapeRegex(s) { return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); }
function generateETag(obj) { return crypto.createHash("sha1").update(JSON.stringify(obj)).digest("hex"); }

export class SellerProductsService {
    async list({ sellerId, storeId, role, query }) {
        const {
            page, limit, sort,
            search, status, category, brand,
            priceMin, priceMax, stockMin, stockMax,
            updatedFrom, updatedTo, fields,
            deleted = "active",
        } = query;
        console.log("deleted🙌", deleted)
        const p = Math.max(1, Number(page) || 1);
        const l = Math.max(1, Number(limit) || 20);
        const skip = (p - 1) * l;

        // ---------- match (במקום filter) ----------

        const match = {};

        // מוכר רגיל – לראות רק את עצמו; אדמין – חופשי
        if (role !== "admin" && sellerId && mongoose.isValidObjectId(sellerId)) {
            match.sellerId = new mongoose.Types.ObjectId(String(sellerId));
        }

        // לסנן לפי חנות רק אם נשלח במפורש ב-query
        if (query.storeId && mongoose.isValidObjectId(query.storeId)) {
            match.storeId = new mongoose.Types.ObjectId(String(query.storeId));
        }

        // מחיקה רכה
        if (deleted === "active") match.isDeleted = false;
        else if (deleted === "deleted") match.isDeleted = true;
        // "all" → בלי תנאי isDeleted

        if (status) match.status = status;
        if (category) match.category = category;
        if (brand) match.brand = brand;

        if (typeof priceMin === "number" || typeof priceMax === "number") {
            match["price.amount"] = {};
            if (typeof priceMin === "number") match["price.amount"].$gte = priceMin;
            if (typeof priceMax === "number") match["price.amount"].$lte = priceMax;
        }

        if (typeof stockMin === "number" || typeof stockMax === "number") {
            match.stock = {};
            if (typeof stockMin === "number") match.stock.$gte = stockMin;
            if (typeof stockMax === "number") match.stock.$lte = stockMax;
        }

        if (updatedFrom || updatedTo) {
            match.updatedAt = {};
            if (updatedFrom) match.updatedAt.$gte = new Date(updatedFrom);
            if (updatedTo) match.updatedAt.$lte = new Date(updatedTo);
        }

        if (search && search.trim()) {
            const q = escapeRegex(search.trim());
            const qHe = normalizeHebrew(search.trim());
            match.$or = [
                { title: new RegExp(q, "i") },
                { brand: new RegExp(q, "i") },
                { model: new RegExp(q, "i") },
                { sku: new RegExp(q, "i") },
                { gtin: search.trim() },
                { "variations.sku": new RegExp(q, "i") },
                { "variations.gtin": search.trim() },
                { title_he_plain: new RegExp(escapeRegex(qHe), "i") },
                { brand_he_plain: new RegExp(escapeRegex(qHe), "i") },
                { model_he_plain: new RegExp(escapeRegex(qHe), "i") },
                { description_he_plain: new RegExp(escapeRegex(qHe), "i") },
            ];
        }

        // projection
        let projection = PREVIEW_PROJECTION;
        if (fields) {
            projection = fields.split(",").reduce((acc, key) => {
                const k = key.trim();
                if (k) acc[k] = 1;
                return acc;
            }, {});
            if (!projection["variations._id"]) projection["variations._id"] = 1;
            if (!projection.images) projection.images = 1;
        }

        const sortObj = sortMap[sort] || sortMap["-updatedAt"];

        // לוגים
        console.log("MATCH→", JSON.stringify(match));
        console.log("PAGE/LIMIT→", p, l);

        // items + total באותו pipeline כדי למנוע פערים
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

        const items = rawItems.map(doc => {
            const hasVariations = Array.isArray(doc.variations) && doc.variations.length > 0;
            const thumbnailUrl = Array.isArray(doc.images) && doc.images.length ? doc.images[0] : null;
            return { ...doc, hasVariations, thumbnailUrl };
        });

        return { items, page: p, limit: l, total, hasNextPage: skip + items.length < total };
    }


    async getOne({ id, sellerId, storeId, role }) {
        // const product = await Product.findById(id).lean();
          // נשתמש ב־includeDeleted כשממש רוצים גם מחוקים
  const product = await Product.findById(id)
    .setOptions({ includeDeleted: true }) // ← זה עוקף את הפילטר
    .lean();
        if (!product) return { notFound: true };

        if (role !== "admin") {
            // בדיקת בעלות כפולה: גם חנות וגם מוכר
            const sameSeller = product.sellerId && String(product.sellerId) === String(sellerId);
            const sameStore = product.storeId && String(product.storeId) === String(storeId);
            if (!sameSeller || !sameStore) {
                return { forbidden: true };
            }
        }

        const etag = generateETag(product);
        return { product, etag };
    }

    async update({ id, sellerId, storeId, role, data, ifMatch }) {
        // מאתרים את המוצר ומוודאים שייך לאותה חנות של המוכר
        const doc = await Product.findById(id);
        if (!doc) return { notFound: true };

        // אם מוכר – מותר לגעת רק במוצרים של החנות שלו
        if (role === "seller") {
            if (!storeId || String(doc.storeId) !== String(storeId)) {
                return { forbidden: true };
            }
        }

        // בדיקת ETag (לא חובה)
        const currentETag = makeETag(doc);
        if (ifMatch && ifMatch !== currentETag) {
            return { preconditionFailed: true };
        }

        // עדכון שדות מותרים
        Object.assign(doc, data);

        await doc.save(); // טריגרי ולידציה/מידלוורים של המודל שלך ירוצו כאן
        const etag = makeETag(doc);

        // החזרת אובייקט נקי (lean) ללקוח
        const updated = doc.toObject({ virtuals: true });
        return { updated, etag };
    }



    async createProduct({ data, actor }) {
        try {
            const doc = new Product({ ...data, createdBy: actor.id, updatedBy: actor.id, });
            console.log("servise product")
            const saved = await doc.save();
            return saved;
        } catch (err) {
            if (err?.code === 11000) {
                if (err?.code === 11000) {
                    console.log("Duplicate key:", err.keyValue, " index:", err.keyPattern);
                    const field = Object.keys(err.keyValue || err.keyPattern || {})[0] || "uniqueField";
                    const e = new Error(`Duplicate ${field}`);
                    e.status = 409;
                    e.field = field;
                    throw e;
                }
                throw err;
            }
            if (err?.name === "ValidationError") {
                const e = new Error(err.message);
                e.status = 400;
                throw e;
            }
            throw err;
        }
    }
    async softDelete(productId, userId) {
        return Product.findByIdAndUpdate(
            productId,
            {
                $set: {
                    isDeleted: true,
                    deletedAt: new Date(),
                    deletedBy: userId,
                },
            },
            { new: true }
        );
    }

    async restore(productId, userId) {
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
            { new: true, includeDeleted: true } // ← זה העיקר
        );
    }




    async updateStatus({ id, nextStatus, actorId, role, sellerId }) {
        if (!mongoose.isValidObjectId(id)) return null;

        const query = { _id: new mongoose.Types.ObjectId(id) };
        const opts = { includeDeleted: true };

        const product = await Product.findOne(query, null, opts);
        if (!product) return null;

        if (role !== "admin") {
            const pSeller = String(product.sellerId || "");
            const reqSeller = String(sellerId || "");
            if (!pSeller || !reqSeller || pSeller !== reqSeller) {
                const err = new Error("You cannot modify a product that isn't yours");
                err.code = "FORBIDDEN";
                throw err;
            }
        }

        const current = product.status;
        const allowedNext = ALLOWED[current] || [];
        if (!allowedNext.includes(nextStatus)) {
            const err = new Error(`Transition ${current} → ${nextStatus} is not allowed`);
            err.code = "INVALID_TRANSITION";
            throw err;
        }

        product.status = nextStatus;
        product.updatedAt = new Date();

        if (!Array.isArray(product.statusHistory)) product.statusHistory = [];
        product.statusHistory.push({ from: current, to: nextStatus, at: new Date(), by: actorId });
        console.log("😂😂😂😂")
        await product.save();
        return product.toObject();
    }

}

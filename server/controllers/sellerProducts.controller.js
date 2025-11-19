import { SellerProductsService } from "../services/sellerProducts.service.js";
import { listQuerySchema, updateStatusSchema, idParamSchema } from "../validations/sellerProductsSchemas.js";
const service = new SellerProductsService();
function pickAllowedUpdate(body = {}) {
    const allow = [
        "title", "titleEn", "brand", "category", "subCategory", "model", "supplier",
        "description", "overview", "specs", "images", "video",
        "currency", "price", "discount",
        "stock", "inStock", "gtin",
        "shipping", "delivery",
        "slug", "metaTitle", "metaDescription",
        "visibility", "scheduledAt", "visibleUntil",
        "status", "sellerSku",
        "variations"
    ];
    const out = {};
    for (const k of allow) {
        if (body[k] !== undefined) out[k] = body[k];
    }
    return out;
}

function validateSchedulingFields({ scheduledAt, visibleUntil }) {// עוזר: בדיקות תאריכים מעבר לוולידציית Zod
    if (scheduledAt && Number.isFinite(+scheduledAt)) {
        const now = Date.now();
        if (new Date(scheduledAt).getTime() < now) {
            const e = new Error("scheduledAt חייב להיות עתידי");
            e.status = 400;
            throw e;
        }
    }
    if (scheduledAt && visibleUntil) {
        const s = new Date(scheduledAt).getTime();
        const u = new Date(visibleUntil).getTime();
        if (u <= s) {
            const e = new Error("visibleUntil חייב להיות אחרי scheduledAt");
            e.status = 400;
            throw e;
        }
    }
}


function stripSellerControlledFields(body) {// עוזר: מסנן שדות שסלר לא יכול לשלוח
    const {
        sellerId, storeId, status, visibility, scheduledAt, visibleUntil,
        ...rest
    } = body || {};
    return rest;
}

export default class SellerProductsController {
    async list(req, res, next) {
        try {
            const role = req.auth?.role || (Array.isArray(req.auth?.roles) ? req.auth.roles[0] : null);
            const sellerId = req.auth?.sellerId || null;
            const storeId = req.auth?.storeId || null;
            console.log("seller/products", req.query)
            const raw = Object.fromEntries(
                Object.entries(req.query || {}).map(([k, v]) => [k, v === "" ? undefined : v])
            );
            const query = listQuerySchema.parse(raw);
            console.log("query", query)

            const result = await service.list({ sellerId, storeId, role, query });
            console.log("result", result)

            return res.json(result);
        } catch (err) {
            if (err?.name === "ZodError") {
                return res.status(422).json({ error: "ValidationError", details: err.errors });
            }
            next(err);
        }
    }

    async getOne(req, res, next) {
        try {
            const role = req.auth?.role || (Array.isArray(req.auth?.roles) ? req.auth.roles[0] : null);
            const sellerId = req.auth?.sellerId || null;
            const storeId = req.auth?.storeId || null;

            const { id } = idParamSchema.parse(req.params);
            const { product, etag, notFound, forbidden } = await service.getOne({ id, sellerId, storeId, role });

            if (notFound) return res.status(404).json({ error: "NotFound" });
            if (forbidden) return res.status(403).json({ error: "Forbidden" });

            if (req.headers["if-none-match"] && req.headers["if-none-match"] === etag) {
                return res.status(304).end();
            }

            res.setHeader("ETag", etag);
            return res.json(product);
        } catch (err) {
            if (err?.name === "ZodError") {
                return res.status(422).json({ error: "ValidationError", details: err.errors });
            }
            next(err);
        }
    }

    async update(req, res, next) {
        try {
            const role = req.auth?.role || (Array.isArray(req.auth?.roles) ? req.auth.roles[0] : null);
            const sellerId = req.auth?.sellerId || null;
            const storeId = req.auth?.storeId || null;

            const { id } = idParamSchema.parse(req.params);

            // לבן את גוף הבקשה
            const data = pickAllowedUpdate(req.body || {});

            // הגנות קטנות/נורמליזציה
            // if (data?.status && ["טיוטא", "מפורסם", "מושהה"].includes(data.status)) {
            //     const map = { "טיוטא": "draft", "מפורסם": "published", "מושהה": "suspended" };
            //     data.status = map[data.status];
            // }
            if (data?.discount) {
                // נרמול תאריכים (אם הגיעו כמחרוזת)
                if (data.discount.startsAt) data.discount.startsAt = new Date(data.discount.startsAt) || null;
                if (data.discount.expiresAt) data.discount.expiresAt = new Date(data.discount.expiresAt) || null;
            }
            if (data?.visibility && !["public", "private", "restricted"].includes(data.visibility)) {
                delete data.visibility;
            }

            // תמיכה אופטימית (לא חובה): If-Match מול ETag קודם
            const ifMatch = req.headers["if-match"] || null;

            const { updated, notFound, forbidden, preconditionFailed, etag } =
                await service.update({ id, sellerId, storeId, role, data, ifMatch });

            if (notFound) return res.status(404).json({ error: "NotFound" });
            if (forbidden) return res.status(403).json({ error: "Forbidden" });
            if (preconditionFailed) return res.status(412).json({ error: "PreconditionFailed" });

            res.setHeader("ETag", etag);
            return res.json(updated);
        } catch (err) {
            if (err?.name === "ZodError") {
                return res.status(422).json({ error: "ValidationError", details: err.errors });
            }
            next(err);
        }
    }
    async create(req, res, next) {
        console.log("creat", req.body)
        try {
            const user = req.user || {};
            const role = user.role;

            if (role === "seller") {
                console.log("seller")

                if (!user.sellerId || !user.storeId) { // ודאות שכל המידע הכרחי אכן קיים על המשתמש
                    const e = new Error("חסר שיוך מוכר/חנות למשתמש. פנה לתמיכה.");
                    e.status = 403;
                    throw e;
                }
                console.log("user", user)
                const cleaned = stripSellerControlledFields(req.body);// סלר לא שולט על שדות רגישים
                const data = { ...cleaned, sellerId: String(user.sellerId), storeId: String(user.storeId), status: "draft", visibility: "private", };
                validateSchedulingFields(data); // בדיקות תזמון (למרות שסלר לא יכול לשלוח כרגע - שמירה לעתיד)
                const product = await service.createProduct({ data, actor: { id: user._id, role }, });
                return res.status(201).json(product);
            }

            if (role === "admin") {
                if (!req.body?.sellerId || !req.body?.storeId) { // אדמין חייב לציין sellerId+storeId תקפים
                    const e = new Error("על אדמין לספק גם sellerId וגם storeId");
                    e.status = 400;
                    throw e;
                }
                validateSchedulingFields(req.body);
                const product = await service.createProduct({ data: req.body, actor: { id: user._id, role }, });
                return res.status(201).json(product);
            }

            const e = new Error("אין הרשאה לביצוע פעולה זו");
            e.status = 403;
            throw e;
        } catch (err) {
            next(err);
        }
    }

    async softDelete(req, res, next) {
        try {
            const { id } = req.params;
            const userId = req.auth?.sub; // או req.auth.userId – תלוי איך שמרת ב־auth

            const product = await service.softDelete(id, userId);
            if (!product) return res.status(404).json({ error: "Product not found" });

            res.json({ success: true, product });
        } catch (err) {
            next(err);
        }
    }

    /* istanbul ignore next */
    async restore(req, res, next) {
        console.log("res🎶")
        try {
            const { id } = req.params;
            console.log("res🎶", id)

            const userId = req.auth?.sub; // מי משחזר
            console.log("res🎶", userId)

            const product = await service.restore(id, userId);
            if (!product) return res.status(404).json({ error: "Product not found" });
            res.json({ success: true, product });
        } catch (err) {
            next(err);
        }
    }

    /* istanbul ignore next */
    async updateStatus(req, res, next) {
        try {
            const { id } = req.params;
            const { status } = updateStatusSchema.parse(req.body);

            const userId = req.auth?.sub;
            const role = req.auth?.role || (Array.isArray(req.auth?.roles) ? req.auth.roles[0] : null);
            const sellerId = req.auth?.sellerId || null;

            const product = await service.updateStatus({
                id,
                nextStatus: status,
                actorId: userId,
                role,
                sellerId,
            });

            if (!product) {
                return res.status(404).json({ error: "Product not found" });
            }

            return res.json({ success: true, product });
        } catch (err) {
            // ולידציה של Zod על הגוף
            if (err?.name === "ZodError") {
                return res.status(422).json({ error: "ValidationError", message: "נתונים לא תקינים", details: err.errors });
            }
            // ולידציה של מעברי סטטוס/הרשאות מה-service
            if (err?.code === "FORBIDDEN") {
                return res.status(403).json({ error: "Forbidden", message: err.message });
            }
            if (err?.code === "INVALID_TRANSITION") {
                return res.status(409).json({ error: "InvalidStatusTransition", message: err.message });
            }
            // ולידציה של Mongoose (למשל: מוצר מפורסם חייב לכלול תמונה)
            if (err?.name === "ValidationError") {
                console.log("err.message", err.message)
                // err.message יכיל את ההודעה מהמודל: "מוצר מפורסם חייב לכלול לפחות תמונה אחת"
                return res.status(400).json({
                    error: "ValidationError",

                    message: err.message,
                    details: err.errors,
                });
            }

            // כל שאר השגיאות – middleware מרכזי
            next(err);
        }
    }

}

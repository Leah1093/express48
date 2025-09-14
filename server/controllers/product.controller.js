import { productService } from "../service/product.service.js";


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

export class ProductController {
     async create(req, res, next) {
        console.log("creat",req.body)
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

                const cleaned = stripSellerControlledFields(req.body);// סלר לא שולט על שדות רגישים
                const data = { ...cleaned, sellerId: String(user.sellerId), storeId: String(user.storeId), status: "draft", visibility: "private", };               
                validateSchedulingFields(data); // בדיקות תזמון (למרות שסלר לא יכול לשלוח כרגע - שמירה לעתיד)
                const product = await productService.createProduct({ data, actor: { id: user._id, role }, });
                return res.status(201).json(product);
            }

            if (role === "admin") {            
                if (!req.body?.sellerId || !req.body?.storeId) { // אדמין חייב לציין sellerId+storeId תקפים
                    const e = new Error("על אדמין לספק גם sellerId וגם storeId");
                    e.status = 400;
                    throw e;
                }
                validateSchedulingFields(req.body);
                const product = await productService.createProduct({ data: req.body, actor: { id: user_id, role }, });
                return res.status(201).json(product);
            }

            const e = new Error("אין הרשאה לביצוע פעולה זו");
            e.status = 403;
            throw e;
        } catch (err) {
            next(err);
        }
    }
}

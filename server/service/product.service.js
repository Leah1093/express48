// services/productService.js
import { Product } from "../models/Product.js";

function buildDuplicateKeyMessage(err) {
    // ניסיון לזהות שדה מתנגש מהשגיאה של מונגו
    const dupField = err?.keyPattern ? Object.keys(err.keyPattern)[0] : null;
    if (dupField === "sku") return "קיים כבר מוצר עם SKU זהה";
    if (dupField === "slug") return "קיים כבר מוצר עם slug זהה בחנות";
    return "מוצר עם מזהה ייחודי זה כבר קיים במערכת";
}

class ProductService {
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
}

export const productService = new ProductService();

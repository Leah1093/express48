// services/storefront.service.js
import { Product } from "../models/product.modeis";
import mongoose from "mongoose";

export class StorefrontService {
    async listPublished({ q, page = 1, limit = 20 }) {
        const query = { status: "published", isDeleted: false };
        if (q) query.$text = { $search: q };

        const [items, total] = await Promise.all([
            Product.find(query)
                .sort("-publishedAt")
                .skip((page - 1) * limit)
                .limit(limit),
            Product.countDocuments(query),
        ]);

        return { items, total, page, pages: Math.ceil(total / limit) };
    }


    async getOnePublic(idOrSlug) {
        const query = { isDeleted: false, status: "published" };

        if (mongoose.Types.ObjectId.isValid(idOrSlug)) {
            return Product.findOne({ ...query, _id: idOrSlug });
        } else {
            return Product.findOne({ ...query, slug: idOrSlug });
        }
    }

}

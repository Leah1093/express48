// services/sitemap.service.js
import { Product } from "../models/Product.js";
import {Category} from "../models/category.js";

class SitemapService {
  async getAllUrls() {
    const categories = await Category.find({ isActive: true })
      .select("fullSlug updatedAt")
      .lean();

    const products = await Product.find({
      isDeleted: false,
      status: "published",
    })
      .select("slug updatedAt storeId")
      .populate({
        path: "storeId",
        select: "slug storeSlug", // תקראי לזה איך שבאמת מוגדר אצלך במודל Store
      })
      .lean();

    return { categories, products };
  }
}

export const sitemapService = new SitemapService();

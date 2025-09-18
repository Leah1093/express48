// services/productService.js
import { Product } from "../models/Product.js";

// פונקציית עזר
function isNewProduct(publishedAt) {
  if (!publishedAt) return false;
  const days = (Date.now() - new Date(publishedAt)) / (1000 * 60 * 60 * 24);
  return days <= 12;
}

class ProductService {
  async listNewProducts(limit = 12) {
    const now = new Date();
    const twelveDaysAgo = new Date(now.getTime() - 12 * 24 * 60 * 60 * 1000);

    const query = {
      status: "published",
      publishedAt: { $gte: twelveDaysAgo }
    };

    const products = await Product.find(query)
      .sort({ publishedAt: -1 })
      .limit(limit)
      .select("title images price currency slug _id storeId discount publishedAt")
      .lean({ virtuals: true });

    return products.map((p) => {
      const { finalAmount, baseAmount, savedAmount, hasDiscount } =
        Product.hydrate(p).getEffectivePricing();

      return {
        _id: p._id,
        title: p.title,
        slug: p.slug,
        images: p.images,
        currency: p.currency,
        basePrice: baseAmount,
        finalPrice: finalAmount,
        discountValue: hasDiscount ? savedAmount : 0,
        hasDiscount,
        isNew: isNewProduct(p.publishedAt) // ← כאן השימוש
      };
    });
  }
  getAllProductsService = async () => {
    try {
      const products = await Product.find({}).populate('storeId');
      return products;
    } catch (err) {
      throw new Error('Error fetching products');
    }
  }

  getProductBySlugService = async (slug) => {
    try {
      const product = await Product.findOne({ slug }).populate('storeId');
      return product;
    } catch (err) {
      throw new Error('Error fetching product by slug');
    }
  }
}

export const productService = new ProductService();

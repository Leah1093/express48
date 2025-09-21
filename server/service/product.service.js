import { Product } from "../models/Product.js";
import { CustomError } from "../utils/CustomError.js";

// פונקציית עזר
function isNewProduct(publishedAt) {
  if (!publishedAt) return false;
  const days = (Date.now() - new Date(publishedAt)) / (1000 * 60 * 60 * 24);
  return days <= 12;
}

class ProductService {
  async listNewProducts(limit = 12) {
    if (typeof limit !== "number" || limit <= 0) {
      throw new CustomError("Limit must be a positive number", 400);
    }

    const now = new Date();
    const twelveDaysAgo = new Date(now.getTime() - 12 * 24 * 60 * 60 * 1000);

    try {
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
        if (!p.publishedAt) {
          throw new CustomError(`Product ${p._id} does not have a publishedAt date`, 500);
        }

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
          isNew: isNewProduct(p.publishedAt)
        };
      });
    } catch (err) {
      throw new CustomError(err.message || "Error listing new products", err.status || 500);
    }
  }

  getAllProductsService = async () => {
    try {
      const products = await Product.find({}).populate("storeId");
      if (!products) throw new CustomError("No products found", 404);
      return products;
    } catch (err) {
      throw new CustomError(err.message || "Error fetching products", err.status || 500);
    }
  };

  getProductBySlugService = async (slug) => {
    if (!slug) throw new CustomError("Slug is required", 400);

    try {
      const product = await Product.findOne({ slug }).populate("storeId");
      if (!product) throw new CustomError(`Product with slug '${slug}' not found`, 404);
      return product;
    } catch (err) {
      throw new CustomError(err.message || "Error fetching product by slug", err.status || 500);
    }
  };
}

export const productService = new ProductService();

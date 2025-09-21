import { productService } from "../service/product.service.js";
import { CustomError } from "../utils/CustomError.js";

export class ProductController {
  async getNewProducts(req, res, next) {
    try {
      const limit = parseInt(req.query.limit, 10) || 12;
      const products = await productService.listNewProducts(limit);
      res.json({ items: products });
    } catch (err) {
      next(new CustomError("שגיאה בשליפת מוצרים חדשים", 500));
    }
  }

  getAllProducts = async (req, res, next) => {
    try {
      const products = await productService.getAllProductsService();
      res.json(products);
    } catch (err) {
      next(new CustomError("שגיאה בשליפת מוצרים", 500));
    }
  };

  getProductsBySlug = async (req, res, next) => {
    const { slug } = req.params;
    try {
      const product = await productService.getProductBySlugService(slug);
      if (!product) {
        throw new CustomError("מוצר לא נמצא", 404);
      }
      res.json(product);
    } catch (err) {
      if (err instanceof CustomError) {
        next(err);
      } else {
        next(new CustomError("שגיאה בשליפת מוצר", 500));
      }
    }
  };
}

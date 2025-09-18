import { productService } from "../service/product.service.js";

export class ProductController {

    async getNewProducts(req, res, next) {
        try {
            const limit = parseInt(req.query.limit, 10) || 12;
            const products = await productService.listNewProducts(limit);

            res.json({ items: products });
        } catch (err) {
            next(err);
        }
    }

    getAllProducts = async (req, res) => {
        try {
            const products = await productService.getAllProductsService();
            res.json(products);
        } catch (err) {
            next(err);
        }
    };

    getProductsBySlug = async (req, res) => {
        const { slug } = req.params;
        try {
            const product = await productService.getProductBySlugService(slug);
            if (!product) {
                const e = new Error('מוצר לא נמצא');
                e.status = 404;
                throw e;
            }
            res.json(product);
        } catch (err) {
            next(err);
        }
    };
}

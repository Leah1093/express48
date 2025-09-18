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
            res.status(500).json({ error: 'שגיאה בשליפת מוצרים' });
        }
    };

    getProductsBySlug = async (req, res) => {
        const { slug } = req.params;
        try {
            const product = await productService.getProductBySlugService(slug);
            if (!product) {
                return res.status(404).json({ error: 'מוצר לא נמצא' });
            }
            res.json(product);
        } catch (err) {
            res.status(500).json({ error: 'שגיאה בשליפת מוצר' });
        }
    };

}

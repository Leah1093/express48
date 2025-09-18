import { productService } from "../service/product.service.js";

export class ProductController {
   async  getNewProducts(req, res, next) {
    try {
        const limit = parseInt(req.query.limit, 10) || 12;
        const products = await productService.listNewProducts(limit);

        res.json({ items: products });
    } catch (err) {
        next(err);
    }
}


}

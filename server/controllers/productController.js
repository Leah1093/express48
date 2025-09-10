import { ProductService } from "../service/productService.js";
const  productService  = new ProductService();

export class ProductController {
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

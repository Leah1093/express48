import express from "express";
import { ProductController } from "../controllers/product.controller.js";
const productController = new ProductController();
const productRouter = express.Router();



productRouter.get("/new", productController.getNewProducts);
productRouter.get("/search", productController.searchProducts);
productRouter.get("/popular-searches", productController.getPopularSearches);

// חשוב: לפני /:slug
productRouter.get("/by-category", productController.getByFullSlug);


// מוצר בודד לפי slug
productRouter.get("/:slug", productController.getProductsBySlug);

// כלל המוצרים (בסוף)
productRouter.get("/", productController.getAllProducts);




export default productRouter;
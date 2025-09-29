import express from "express";
import { ProductController } from "../controllers/product.controller.js";
const productController = new ProductController();
const productRouter = express.Router();

productRouter.get("/new", productController.getNewProducts);
productRouter.get("/search", productController.searchProducts);
productRouter.get('/', productController.getAllProducts);
productRouter.get('/:slug', productController.getProductsBySlug);

export default productRouter;
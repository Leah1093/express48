import express from "express";
import { requireRoles } from "../middlewares/requireRoles.js";
import { validate } from "../middlewares/validate.js";
import { createProductSchema } from "../validations/productSchemas.js";
import { authMiddleware } from "../middlewares/auth.js";
import { ProductController } from "../controllers/product.controller.js";
const productController = new ProductController();
const productRouter = express.Router();
productRouter.get('/', productController.getAllProducts);
productRouter.get('/:slug', productController.getProductsBySlug);

productRouter.get("/new", productController.getNewProducts);
export default productRouter;

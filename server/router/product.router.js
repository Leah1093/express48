import express from "express";
import { requireRoles } from "../middlewares/requireRoles.js";
import { validate } from "../middlewares/validate.js";
import { createProductSchema } from "../validations/productSchemas.js";
import { authMiddleware } from "../middlewares/auth.js";
import { ProductController } from "../controllers/product.controller.js";
const productController = new ProductController();
const productRouter = express.Router();

/** יצירת מוצר ע״י מוכר או אדמין */
// router.post("/", authCookieMiddleware, requireRole(["seller", "admin"]), validate(createProductSchema), productController.create);
productRouter.post(  "/products",  authMiddleware,  requireRoles("seller", "admin"),  productController.create);
export default productRouter;

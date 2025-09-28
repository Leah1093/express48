// routes/admin.products.routes.js
import express from "express";
import { authMiddleware } from "../middlewares/auth.js";
import { requireAdmin } from "../middlewares/requireAdmin.js";
import { validate } from "../middlewares/validate.js";
import { adminIdParamsSchema, adminSetStatusSchema } from "../validations/productSchemas.js";
import AdminProductsController from "../controllers/admin.products.controller.js";
const adminProductsRouter = express.Router();
const adminProductsController = new AdminProductsController();

adminProductsRouter.use("/admin", authMiddleware, requireAdmin);

// תור לאישור
adminProductsRouter.get("/admin/products", adminProductsController.listPending);

// שינוי סטטוס מוצר
adminProductsRouter.patch("/admin/products/:id/status", validate(adminIdParamsSchema, "params"), validate(adminSetStatusSchema, "body"), adminProductsController.setStatus);

export default adminProductsRouter;

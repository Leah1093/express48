import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.js";
import { requireRoles } from "../middlewares/requireRoles.js";
import SellerProductsController from "../controllers/sellerProducts.controller.js";
const sellerProductsRouter = Router();
const sellerProductsController = new SellerProductsController()
// גישה רק למוכר או אדמין
sellerProductsRouter.get("/", authMiddleware, requireRoles("seller", "admin"), sellerProductsController.list);
sellerProductsRouter.post("/", authMiddleware, requireRoles("seller", "admin"), sellerProductsController.create);
sellerProductsRouter.get("/:id", authMiddleware, requireRoles("seller", "admin"), sellerProductsController.getOne);
sellerProductsRouter.patch("/:id", authMiddleware, requireRoles("seller", "admin"), sellerProductsController.update);
sellerProductsRouter.delete("/:id", authMiddleware, requireRoles("seller", "admin"), sellerProductsController.softDelete);
sellerProductsRouter.patch("/:id/restore", authMiddleware, requireRoles("seller", "admin"), sellerProductsController.restore);
sellerProductsRouter.patch("/:id/status", authMiddleware, requireRoles("seller", "admin"), sellerProductsController.updateStatus);


export { sellerProductsRouter };


// routes/marketplace.routes.js
import express from "express";
import MarketplaceController from "../controllers/marketplace.controller.js";
import { authCookieMiddleware } from "../middlewares/authCookie.middleware.js";
import { requireRoles } from "../middlewares/requireRoles.js";
import { validate } from "../middlewares/validate.js";
import { idParamsSchema } from "../validations/seller.schema.js";
import { authMiddleware } from "../middlewares/auth.js";

const marketplaceRouter = express.Router();
const marketplaceController = new MarketplaceController();


marketplaceRouter.post("/sellers", authCookieMiddleware, marketplaceController.createSeller);
marketplaceRouter.get("/sellers/me", authCookieMiddleware, marketplaceController.mySeller);
marketplaceRouter.put("/sellers/:id", authCookieMiddleware, validate(idParamsSchema, "params"), marketplaceController.updateSeller);
marketplaceRouter.get("/admin/sellers", authMiddleware, requireRoles("admin"), marketplaceController.listSellers);
marketplaceRouter.patch("/admin/sellers/:id/status", authCookieMiddleware, requireRoles("admin"), validate(idParamsSchema, "params"), marketplaceController.adminUpdateSellerStatus);
export { marketplaceRouter };

import express from "express";
import MarketplaceController from "../controllers/marketplace.controller.js";
import { authMiddleware } from "../middlewares/auth.js";
import { requireRoles } from "../middlewares/requireRoles.js";
import { validate } from "../middlewares/validate.js";
import { 
  idParamsSchema,
  createSellerSchema,
  updateSellerSchema,
  adminUpdateStatusSchema
} from "../validations/seller.schema.js";

const marketplaceRouter = express.Router();
const marketplaceController = new MarketplaceController();

// יצירת Seller
marketplaceRouter.post(
  "/sellers",
  authMiddleware,
  validate(createSellerSchema),      // ✅ ולידציה של body
  marketplaceController.createSeller
);

// Seller של המשתמש המחובר
marketplaceRouter.get(
  "/sellers/me",
  authMiddleware,
  marketplaceController.mySeller
);

// עדכון Seller
marketplaceRouter.put(
  "/sellers/:id",
  authMiddleware,
  validate(idParamsSchema, "params"),
  validate(updateSellerSchema),      // ✅ ולידציה של body
  marketplaceController.updateSeller
);

// רשימת Sellers לאדמין
marketplaceRouter.get(
  "/admin/sellers",
  authMiddleware,
  requireRoles("admin"),
  marketplaceController.listSellers
);

// עדכון סטטוס Seller ע"י אדמין
marketplaceRouter.patch(
  "/admin/sellers/:id/status",
  authMiddleware,
  requireRoles("admin"),
  validate(idParamsSchema, "params"),
  validate(adminUpdateStatusSchema), // ✅ ולידציה של body
  marketplaceController.adminUpdateSellerStatus
);

export { marketplaceRouter };

import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.js";
import { requireRoles } from "../middlewares/requireRoles.js";
import { SellerReportsController } from "../controllers/sellerReports.controller.js";

const router = Router();
const controller = new SellerReportsController();

// סיכום לפי מוצר
router.get(
  "/products",
  authMiddleware,
  requireRoles("seller", "admin"),
  controller.productsSummary.bind(controller)
);

// פירוט לפי מוצר
router.get(
  "/products/:id",
  authMiddleware,
  requireRoles("seller", "admin"),
  controller.productDetails.bind(controller)
);

export { router as sellerReportsRouter };

import express from "express";
import { SellerOrdersController } from "../controllers/SellerOrdersController.js";
import { requireSellerRole } from "../middlewares/requireSellerRole.js";
import { authMiddleware } from "../middlewares/auth.js";

const router = express.Router();
const controller = new SellerOrdersController();

router.get(
  "/",
  authMiddleware,
  requireSellerRole,
  controller.getSellerOrdersForSeller
);

router.patch(
  "/:orderId/status",
  authMiddleware,
  requireSellerRole,
  (req, res, next) =>
    controller.updateOrderStatusForSeller(req, res, next)
);


export { router as sellerOrdersRouter };

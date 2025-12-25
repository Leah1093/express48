import { Router } from "express";
import { authCookieMiddleware } from "../middlewares/authCookie.middleware.js";
import { AffiliatePayoutAdminController } from "../controllers/affiliatePayoutAdmin.controller.js";

const router = Router();

router.get(
  "/admin/payouts",
  authCookieMiddleware,
  (req, res, next) => AffiliatePayoutAdminController.list(req, res, next)
);

router.get(
  "/admin/payouts/:id",
  authCookieMiddleware,
  (req, res, next) => AffiliatePayoutAdminController.getById(req, res, next)
);

router.post(
  "/admin/payouts/:id/approve",
  authCookieMiddleware,
  (req, res, next) => AffiliatePayoutAdminController.approve(req, res, next)
);

router.post(
  "/admin/payouts/:id/reject",
  authCookieMiddleware,
  (req, res, next) => AffiliatePayoutAdminController.reject(req, res, next)
);

router.post(
  "/admin/payouts/:id/processing",
  authCookieMiddleware,
  (req, res, next) => AffiliatePayoutAdminController.setProcessing(req, res, next)
);

router.post(
  "/admin/payouts/:id/mark-paid",
  authCookieMiddleware,
  (req, res, next) => AffiliatePayoutAdminController.markPaid(req, res, next)
);

export { router as affiliatePayoutAdminRouter };

import { Router } from "express";
import { AffiliateController } from "../controllers/affiliate.controller.js";
import {
  affiliateAcceptTermsSchema,
  affiliateApplySchema,
} from "../validations/affiliate.validation.js";
import { affiliateTrackClickSchema } from "../validations/affiliate.validation.js";

import { validate } from "../middlewares/validate.js";
import { authCookieMiddleware } from "../middlewares/authCookie.middleware.js"; // לפי מה שיש אצלך
import { affiliateRequestPayoutSchema } from "../validations/affiliatePayout.validation.js";

const router = Router();
// 0) Track click (ללא auth)
router.post(
  "/track-click",
  validate(affiliateTrackClickSchema),
  (req, res, next) => AffiliateController.trackClick(req, res, next)
);

// 1) קבלת תנאים + שמירת הסכמה
router.post(
  "/accept-terms",
  authCookieMiddleware,
  validate(affiliateAcceptTermsSchema),
  (req, res, next) => AffiliateController.acceptTerms(req, res, next)
);

// 2) הגשת בקשה (רק אחרי accept-terms)
router.post(
  "/apply",
  authCookieMiddleware,
  validate(affiliateApplySchema),
  (req, res, next) => AffiliateController.apply(req, res, next)
);

// 3) מי אני / סטטוס
router.get(
  "/me",
   (req, res, next) => {
    console.log("=== AFFILIATE /me HIT ===");
    console.log("raw cookie header:", req.headers.cookie);
    console.log("req.cookies:", req.cookies);
    next();
  },
  authCookieMiddleware,
  (req, res, next) => AffiliateController.me(req, res, next)
);
// 4) הזמנות מיוחסות לשותף
router.get(
  "/orders",
  authCookieMiddleware,
  (req, res, next) => AffiliateController.orders(req, res, next)
);

// 5) סיכום לשותף
router.get(
  "/summary",
  authCookieMiddleware,
  (req, res, next) => AffiliateController.summary(req, res, next)
);


// 6) Analytics summary (עם auth)
router.get(
  "/analytics/summary",
  authCookieMiddleware,
  (req, res, next) => AffiliateController.analyticsSummary(req, res, next)
);
// 7) Analytics timeseries (עם auth)
router.get(
  "/analytics/timeseries",
  authCookieMiddleware,
  (req, res, next) => AffiliateController.analyticsTimeseries(req, res, next)
);
// 8) Commissions list
router.get(
  "/commissions",
  authCookieMiddleware,
  (req, res, next) => AffiliateController.commissions(req, res, next)
);

// 9) Commissions summary
router.get(
  "/commissions/summary",
  authCookieMiddleware,
  (req, res, next) => AffiliateController.commissionsSummary(req, res, next)
);
// 10) Available payout
router.get(
  "/payouts/available",
  authCookieMiddleware,
  (req, res, next) => AffiliateController.payoutsAvailable(req, res, next)
);

// 11) Payouts history
router.get(
  "/payouts",
  authCookieMiddleware,
  (req, res, next) => AffiliateController.payouts(req, res, next)
);

// 12) Request payout
router.post(
  "/payouts/request",
  authCookieMiddleware,
  validate(affiliateRequestPayoutSchema),
  (req, res, next) => AffiliateController.requestPayout(req, res, next)
);


export { router as affiliateRouter };

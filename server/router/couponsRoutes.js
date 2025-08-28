import { Router } from "express";
import { CouponController } from "../controllers/couponController.js";
import { authCookieMiddleware } from "../middlewares/authCookieMiddleware.js";

const router = Router();

router.post("/", authCookieMiddleware, CouponController.create); // יצירת קופון
router.post("/validate", authCookieMiddleware, CouponController.validate); // בדיקת קופון
router.post("/apply", authCookieMiddleware, CouponController.apply); // סימון שימוש

export default router;

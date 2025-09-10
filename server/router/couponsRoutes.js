import { Router } from "express";
import { couponController } from "../controllers/couponController.js";
import { authCookieMiddleware } from "../middlewares/authCookie.middleware.js";

const router = Router();

router.post("/", authCookieMiddleware, couponController.create); // יצירת קופון
router.post("/validate", authCookieMiddleware, couponController.validate); // בדיקת קופון
router.post("/apply", authCookieMiddleware, couponController.apply); // סימון שימוש

export default router;

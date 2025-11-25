import { Router } from "express";
import { couponController } from "../controllers/couponController.js";
import { authMiddleware } from "../middlewares/auth.js";

const router = Router();

router.get("/", authMiddleware, couponController.list);
router.post("/", authMiddleware, couponController.create); // יצירת קופון
router.post("/validate", authMiddleware, couponController.validate); // בדיקת קופון
router.post("/apply", authMiddleware, couponController.apply); // סימון שימוש
router.delete("/:id", authMiddleware, couponController.delete);
router.put("/:id", authMiddleware, couponController.update);


export default router;

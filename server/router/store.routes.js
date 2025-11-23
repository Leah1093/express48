import express from "express";
import StoreController from "../controllers/store.controller.js";
import { authMiddleware } from "../middlewares/auth.js";
import { requireRoles } from "../middlewares/requireRoles.js";

const storeRouter = express.Router();
const storeController = new StoreController();

// חנות של המוכר המחובר
storeRouter.get("/seller/store/me", authMiddleware, requireRoles("seller"), storeController.getMyStore);

// עדכון / יצירת חנות של המוכר
storeRouter.put("/seller/store/me", authMiddleware, requireRoles("seller"), storeController.saveMyStore);

export { storeRouter };

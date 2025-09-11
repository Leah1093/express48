// routes/store.routes.js
import express from "express";
import StoreController from "../controllers/store.controller.js";
import { authCookieMiddleware } from "../middlewares/authCookie.middleware.js";
import { requireRoles } from "../middlewares/requireRoles.js";

const storeRouter = express.Router();
const storeController = new StoreController();

// חנות של המוכר המחובר
storeRouter.get("/seller/store/me", authCookieMiddleware, requireRoles("seller"), storeController.getMyStore);

// עדכון / יצירת חנות של המוכר
storeRouter.put("/seller/store/me", authCookieMiddleware, requireRoles("seller"), storeController.saveMyStore);

export { storeRouter };

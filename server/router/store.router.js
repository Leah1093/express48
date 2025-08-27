// routes/store.routes.js
import express from "express";
import StoreController from "../controllers/store.controller.js";
import { authCookieMiddleware } from "../middlewares/authCookie.middleware.js";
import { requireRoles } from "../middlewares/requireRoles.js";
import { uploadStoreMedia, processStoreMedia } from "../middlewares/uploadMedia.middleware.js";
import { idParamsSchema } from "../validations/seller.schema.js";
import { updateStoreStatusSchema } from "../validations/store.schema.js";
import { validate } from "../middlewares/validate.js";
const storeRouter = express.Router();
const storeController = new StoreController();

storeRouter.get("/me", authCookieMiddleware, requireRoles("seller"), storeController.getMyStore);
storeRouter.put("/me", authCookieMiddleware, requireRoles("seller"), storeController.saveMyStore);
storeRouter.post("/me/media", authCookieMiddleware, requireRoles("seller"), uploadStoreMedia, processStoreMedia, storeController.uploadAllMedia);
storeRouter.put("/me/slug", authCookieMiddleware, requireRoles("seller"), storeController.updateMySlug);
storeRouter.put("/admin/:id/slug", authCookieMiddleware, requireRoles("admin"), validate(idParamsSchema, "params"), storeController.adminUpdateSlug);
storeRouter.put("/me/status", authCookieMiddleware, requireRoles("seller"), validate(updateStoreStatusSchema, "body"), storeController.updateMyStatus);
storeRouter.patch("/admin/:id/status", authCookieMiddleware, requireRoles("admin"), validate(idParamsSchema, "params"), validate(updateStoreStatusSchema, "body"), storeController.adminUpdateStoreStatus);
export { storeRouter };
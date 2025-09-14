// routes/store.routes.js
import express from "express";
import StoreController from "../controllers/store.controller.js";
import { authMiddleware } from "../middlewares/auth.js";
import { requireRoles } from "../middlewares/requireRoles.js";
import { uploadStoreMedia, processStoreMedia } from "../middlewares/uploadMedia.middleware.js";
import { idParamsSchema } from "../validations/seller.schema.js";
import { updateStoreStatusSchema } from "../validations/store.schema.js";
import { validate } from "../middlewares/validate.js";

const storeRouter = express.Router();
const storeController = new StoreController();

storeRouter.get("/me", authMiddleware, requireRoles("seller"), storeController.getMyStore);
storeRouter.put("/me", authMiddleware, requireRoles("seller"), storeController.saveMyStore);
storeRouter.post("/me/media", authMiddleware, requireRoles("seller"), uploadStoreMedia, processStoreMedia, storeController.uploadAllMedia);
storeRouter.put("/me/slug", authMiddleware, requireRoles("seller"), storeController.updateMySlug);
storeRouter.put("/admin/:id/slug", authMiddleware, requireRoles("admin"), validate(idParamsSchema, "params"), storeController.adminUpdateSlug);
storeRouter.put("/me/status", authMiddleware, requireRoles("seller"), validate(updateStoreStatusSchema, "body"), storeController.updateMyStatus);
storeRouter.patch("/admin/:id/status", authMiddleware, requireRoles("admin"), validate(idParamsSchema, "params"), validate(updateStoreStatusSchema, "body"), storeController.adminUpdateStoreStatus);
export { storeRouter };
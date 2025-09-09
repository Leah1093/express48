// routes/addressRoutes.js
import express from "express";
import { AddressController } from "../controllers/addressController.js";
import { authCookieMiddleware } from "../middlewares/authCookie.middleware.js";
import { validate } from "../middlewares/validate.js";
import { createAddressSchema, updateAddressSchema } from "../validations/addressValidation.js";

const router = express.Router();
const controller = new AddressController();

// כל הכתובות דורשות התחברות
router.use(authCookieMiddleware);

router.post("/", validate(createAddressSchema), controller.create);
router.get("/", controller.list);
router.get("/:id", controller.get);
router.put("/:id", validate(updateAddressSchema), controller.update);
router.delete("/:id", controller.remove);
router.patch("/:id/default", controller.setDefault);

export default router;

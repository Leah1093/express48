import { Router } from "express";
import { OrderController } from "../controllers/orderController.js";
import { authCookieMiddleware } from "../middlewares/authCookie.middleware.js";
import { validate } from "../middlewares/validate.js";
import {updateStatusSchema,createOrderSchema} from "../validations/orderValidation.js"

const router = Router();
const controller = new OrderController();

router.use(authCookieMiddleware);

router.post("/", validate(createOrderSchema), controller.create);
router.get("/", controller.list);
router.get("/:id", controller.getOne);
router.patch("/:id/status",validate(updateStatusSchema), controller.updateStatus);
router.delete("/:id", controller.remove);

export default router;

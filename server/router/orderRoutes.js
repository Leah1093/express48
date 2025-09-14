import { Router } from "express";
import { OrderController } from "../controllers/orderController.js";
import { authMiddleware } from "../middlewares/auth.js";
import { validate } from "../middlewares/validate.js";
import {updateStatusSchema,createOrderSchema} from "../validations/orderValidation.js"

const router = Router();
const controller = new OrderController();

router.use(authMiddleware);

router.post("/", validate(createOrderSchema), controller.create);
router.get("/", controller.list);
router.get("/:id", controller.getOne);
router.patch("/:id/status",validate(updateStatusSchema), controller.updateStatus);
router.delete("/:id", controller.remove);

export default router;

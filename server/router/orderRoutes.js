// import { Router } from "express";
// import { OrderController } from "../controllers/orderController.js";
// import { authMiddleware } from "../middlewares/auth.js";
// import { validate } from "../middlewares/validate.js";
// import {updateStatusSchema,createOrderSchema} from "../validations/orderValidation.js"

// const router = Router();
// const controller = new OrderController();

// router.use(authMiddleware);

// router.post("/", validate(createOrderSchema), controller.create);
// router.get("/", controller.list);
// router.get("/:id", controller.getOne);
// router.patch("/:id/status",validate(updateStatusSchema), controller.updateStatus);
// router.delete("/:id", controller.remove);

// export default router;

// server/router/orderRoutes.js (או איך שהקובץ נקרא אצלך)
import { Router } from "express";
import { OrderController } from "../controllers/orderController.js";
import { authMiddleware } from "../middlewares/auth.js";
import { validate } from "../middlewares/validate.js";
import {
  updateStatusSchema,
  createOrderSchema,
} from "../validations/orderValidation.js";
import { OrderService } from "../services/orderService.js";

const router = Router();
const controller = new OrderController();
const orderService = new OrderService();

if (process.env.NODE_ENV !== "production") {
  router.post("/:id/dev-mark-paid", async (req, res, next) => {
    try {
      const orderId = req.params.id;

      console.log("[DEV] /orders/:id/dev-mark-paid called with", orderId);

      const result = await orderService.markPaid(orderId, {
        gateway: "dev-manual",
        transaction_index: "DEV-" + Date.now(),
        payload: { dev: true },
      });

      return res.json({
        ok: true,
        orderId,
        status: result.status,
        payment: result.payment,
      });
    } catch (err) {
      next(err);
    }
  });
}

router.use(authMiddleware);

router.post("/", validate(createOrderSchema), controller.create);
router.get("/", controller.list);
router.get("/:id", controller.getOne);
router.patch("/:id/status", validate(updateStatusSchema), controller.updateStatus);
router.delete("/:id", controller.remove);

export default router;


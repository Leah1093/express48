import express from "express";
import { UserController } from "../controllers/user.controller.js";

// import {
//   profileSchema,
//   passwordSchema,
// } from "../../client/src/components/validations/profileSchema.js";
// import { validate } from "../middlewares/validate.js";

import { authMiddleware } from "../middlewares/auth.js";

const userRouter = express.Router();
const userController = new UserController();
userRouter.put("/update-profile", authMiddleware, userController.updateProfile);
userRouter.get(
  "/seller/users",
  authMiddleware, // אם יש לך
  userController.listCustomers
);

export { userRouter };

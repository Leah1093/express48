import express from "express";
import { UserController } from "../controllers/user.controller.js";
import { validate } from "../middlewares/validate.js";

import { authMiddleware } from "../middlewares/auth.js";
const userRouter = express.Router();
const userController=new UserController();
userRouter.put("/update-profile", authMiddleware, validate(profileSchema), userController.updateProfile);

export  {userRouter};

import express from "express";
import { UserController } from "../controllers/user.controller.js";
import { authMiddleware } from "../middlewares/auth.js";

const userRouter = express.Router();
const userController=new UserController();
userRouter.put("/update-profile", authMiddleware, userController.updateProfile);

export  {userRouter};

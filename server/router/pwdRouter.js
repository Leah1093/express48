import express from "express";

import PasswordController from "../controllers/pwdController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";

const passwordRouter = express.Router();
const pwdController = new PasswordController();

passwordRouter.post("/change-password", authMiddleware, pwdController.changePassword)
passwordRouter.post("/forgot-password", pwdController.forgotPassword);
passwordRouter.post("/reset-password", pwdController.resetPassword);
export {
    passwordRouter
}
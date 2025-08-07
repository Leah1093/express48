import express from "express";
import { passwordSchema } from "../validations/passwordSchema.js";
import PasswordController from "../controllers/pwdController.js";
import { recaptchaV2Middleware } from "../middlewares/recaptchaV2.js";
import { authCookieMiddleware } from "../middlewares/authCookieMiddleware.js";
import { validate } from "../middlewares/validate.js";
import { resetPasswordLimiter,changePasswordLimiter } from "../middlewares/limitPassword.js";
const passwordRouter = express.Router();
const pwdController = new PasswordController();

passwordRouter.post("/change-password",validate(passwordSchema), authCookieMiddleware, pwdController.changePassword)
passwordRouter.post("/forgot-password", changePasswordLimiter,recaptchaV2Middleware,pwdController.forgotPassword);
passwordRouter.post("/reset-password",resetPasswordLimiter, pwdController.resetPassword);
export {
    passwordRouter
}
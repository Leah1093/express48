import express from "express";
import { passwordSchema,emailSchema } from "../validations/passwordSchema.js";
import PasswordController from "../controllers/pwd.controller.js";
import { recaptchaV2Middleware } from "../middlewares/recaptchaV2.js";
import { authMiddleware } from "../middlewares/auth.js";
import { validate } from "../middlewares/validate.js";
// import { resetPasswordLimiter,changePasswordLimiter } from "../middlewares/limitPassword.js";
import { resetPasswordLimiter ,changePasswordLimiter} from "../middlewares/rateLimit.middleware.js";
const passwordRouter = express.Router();
const pwdController = new PasswordController();

passwordRouter.post("/change-password",changePasswordLimiter,validate(passwordSchema), authMiddleware, pwdController.changePassword)
passwordRouter.post("/forgot-password", resetPasswordLimiter ,recaptchaV2Middleware, validate(emailSchema),pwdController.forgotPassword);
passwordRouter.post("/reset-password",pwdController.resetPassword);
export {
    passwordRouter
}
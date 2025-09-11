// routes/authRoutes.js
import express from "express";
import EntranceController from "../controllers/entrance.controller.js";
import { authMiddleware } from "../middlewares/auth.js";
import { loginLimiter,refreshLimiter } from "../middlewares/rateLimit.middleware.js";
const entrController = new EntranceController();
const entranceRouter = express.Router();

entranceRouter.post("/register",entrController.register)
entranceRouter.post("/login",loginLimiter,entrController.login)
entranceRouter.post("/logout",authMiddleware, entrController.logout);
entranceRouter.get("/me", authMiddleware, entrController.getCurrentUser);
entranceRouter.post("/refresh",refreshLimiter,entrController.refresh);

export { entranceRouter}

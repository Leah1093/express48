import express from "express";
import GoogleAuthController from "../controllers/googleAuth.controller.js";
const googleAuthRouter = express.Router();
const googleController = new GoogleAuthController();

googleAuthRouter.post("/google", googleController.googleLogin);

export {
  googleAuthRouter
};

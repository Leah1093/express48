import express from "express";
import EntranceController from "../controllers/entrance.controller.js";
import { authCookieMiddleware } from "../middlewares/authCookie.middleware.js";


const entranceRouter = express.Router();
const entrController = new EntranceController();

entranceRouter.post("/login",entrController.login)
entranceRouter.post("/register",entrController.register)
entranceRouter.post("/login",entrController.login)
entranceRouter.post("/logout", entrController.logout);
entranceRouter.get("/me", authCookieMiddleware, entrController.getCurrentUser);

export {
    entranceRouter 
}

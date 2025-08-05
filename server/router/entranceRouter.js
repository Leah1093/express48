import express from "express";
import EntranceController from "../controllers/entranceController.js";
import { authCookieMiddleware } from "../middlewares/authCookieMiddleware.js";


const entranceRouter = express.Router();
const entrController = new EntranceController();

entranceRouter.post("/login",entrController.login)
entranceRouter.post("/register",entrController.register)
entranceRouter.get("/me", authCookieMiddleware, entrController.getCurrentUser);

export {
    entranceRouter 
}

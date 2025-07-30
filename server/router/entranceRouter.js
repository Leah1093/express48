import express from "express";
import EntranceController from "../controllers/entranceController.js";

const entranceRouter = express.Router();
const entrController = new EntranceController();

entranceRouter.post("/login",entrController.login)
// entranceRouter.post("/register",entrController.register)

export {
    entranceRouter 
}

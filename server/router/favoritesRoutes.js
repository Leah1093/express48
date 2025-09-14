
import express from "express";
import { FavoritesController } from "../controllers/favoritesController.js";
import { authMiddleware } from "../middlewares/auth.js";

export const favoritesRouter = express.Router();
const  favoritesController = new FavoritesController();


favoritesRouter.use(authMiddleware); // כל הנתיבים דורשים יוזר מחובר

favoritesRouter.post("/", favoritesController.add);
favoritesRouter.delete("/:productId", favoritesController.remove);
favoritesRouter.get("/", favoritesController.list);
favoritesRouter.get("/exists", favoritesController.exists);
favoritesRouter.post("/merge", favoritesController.merge); // ← חדש

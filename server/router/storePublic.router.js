import express from "express";
import { StorePublicController } from "../controllers/storePublic.controller.js";
import { validate } from "../middlewares/validate.js";
import { slugParamsSchema } from "../validations/store.schema.js";
import { authOptional } from "../middlewares/authOptional.js";
const storePublicRouter = express.Router();
const storePublicController = new StorePublicController();

storePublicRouter.get("/:slug", authOptional, validate(slugParamsSchema, "params"), storePublicController.getPublicStore);
export { storePublicRouter };

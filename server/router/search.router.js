import { Router } from "express";
import { SearchController } from "../controllers/search.controller.js";

const router = Router();

router.get("/suggest", SearchController.suggest);
router.get("/quick",   SearchController.quick);
router.get("/results", SearchController.results);

export default router;

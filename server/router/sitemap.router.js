// router/sitemap.router.js
import { Router } from "express";
import { sitemapController } from "../controllers/sitemap.controller.js";

const router = Router();

// שימי לב: לא להעביר את getSitemap ישירות, אלא לעטוף אותה בפונקציה
router.get("/sitemap.xml", (req, res, next) =>
  sitemapController.getSitemap(req, res, next)
);

export { router as sitemapRouter };

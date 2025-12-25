// router/zapFeedRoutes.js
import { Router } from "express";
import {
  buildZapCategoryIndex,
  buildZapFeedXml,
} from "../services/zapFeedService.js";

const router = Router();

// עמוד רשימת קטגוריות – זה הקישור הראשי שאת נותנת ל-ZAP
router.get("/zap", async (req, res, next) => {
  try {
    const html = await buildZapCategoryIndex();
    res.type("html").send(html);
  } catch (err) {
    next(err);
  }
});

// הפיד עצמו – כללי או לפי קטגוריה
router.get("/zap-feed.xml", async (req, res, next) => {
  try {
    const { category } = req.query;
    const xml = await buildZapFeedXml({
      categoryKey: category || null,
    });
    res.type("application/xml").send(xml);
  } catch (err) {
    next(err);
  }
});

export default router;

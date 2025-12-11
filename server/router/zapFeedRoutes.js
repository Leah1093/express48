// router/zapFeedRoutes.js
import express from "express";
import {
  buildZapFeedXml,
  buildZapCategoriesXml,
} from "../services/zapFeedService.js";

const router = express.Router();

// פיד מוצרים (אופציונלי: ?category=fullSlug)
router.get("/zap-feed.xml", async (req, res, next) => {
  try {
    const categoryFullSlug = req.query.category || null;
    const xml = await buildZapFeedXml({ categoryFullSlug });
    res.header("Content-Type", "application/xml; charset=utf-8");
    res.send(xml);
  } catch (err) {
    next(err);
  }
});

// פיד TREE של קטגוריות
router.get("/zap-tree.xml", async (req, res, next) => {
  try {
    const xml = await buildZapCategoriesXml();
    res.header("Content-Type", "application/xml; charset=utf-8");
    res.send(xml);
  } catch (err) {
    next(err);
  }
});

export default router;

// src/routes/zapFeed.routes.js
import express from "express";
import { buildZapFeedXml } from "../services/zapFeedService.js";

const router = express.Router();

router.get("/zap-feed.xml", async (req, res, next) => {
  try {
    const xml = await buildZapFeedXml();
    res.header("Content-Type", "application/xml; charset=utf-8");
    res.send(xml);
  } catch (err) {
    next(err);
  }
});

export default router;

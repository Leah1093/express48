// server/routes/variationAttributes.js
import { Router } from "express";
import {  allowedVariationAttributes,  categoryVariationMap,  attributeLabels,  attributeValueHints,  getAllowedVariationKeysForCategory} from "../config/variationAttributes.js";
const router = Router();

// GET /api/variation-attributes
router.get("/", (req, res) => {
  const { category } = req.query; // אופציונלי: ?category=טלפונים
  const allowedForCategory = getAllowedVariationKeysForCategory(category);
  res.json({
    allowedVariationAttributes,
    categoryVariationMap,
    attributeLabels,
    attributeValueHints,
    allowedForCategory
  });
});

export default router;

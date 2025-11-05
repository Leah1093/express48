// routes/storefront.routes.js
import express from "express";
import { StorefrontController } from "../controllers/storefront.controller.js";
import { validate } from "../middlewares/validate.js";
import { listPublicSchema } from "../validation/storefrontSchemas.js";

const r = express.Router();
const c = new StorefrontController();

// רשימת מוצרים מפורסמים (ציבורי)
r.get("/products", validate(listPublicSchema, "query"), c.list);

// פריט לפי id או slug (ציבורי)
r.get("/products/:idOrSlug", c.getOne);

export default r;

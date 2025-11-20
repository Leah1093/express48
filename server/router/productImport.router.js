// src/router/productImport.router.js
import { Router } from "express";
import multer from "multer";
import { ProductImportController } from "../controllers/productImport.controller.js";
import { authMiddleware } from "../middlewares/auth.js";
import { requireRoles } from "../middlewares/requireRoles.js";

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post(
  "/import-csv",                  // 👈 שימי לב: לא עם /seller/products פה
  authMiddleware,
  requireRoles("seller", "admin"),
  upload.single("file"),          // name="file"
  ProductImportController.importCsv
);

export { router as productImportRouter };

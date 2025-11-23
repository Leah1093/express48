import { Router } from "express";
import multer from "multer";
import { ProductImportController } from "../controllers/productImport.controller.js";
import { authMiddleware } from "../middlewares/auth.js";
import { requireRoles } from "../middlewares/requireRoles.js";

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post(
  "/import-csv",                 
  authMiddleware,
  requireRoles("seller", "admin"),
  upload.single("file"),          
  ProductImportController.importCsv
);

export { router as productImportRouter };

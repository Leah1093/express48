import express from "express";
import { CategoryController } from "../controllers/categoryController.js";
import { validate } from "../middlewares/validate.js";
import { createCategorySchema, updateCategorySchema } from "../validations/categorySchemas.js";
import { upload } from "../middlewares/upload.js";

const router = express.Router();
const controller = new CategoryController();

// עוזר קטן: מבטיח שפונקציה תמיד תועבר ל־router
const h = (fn) => (req, res, next) => fn(req, res, next);

// --- סטטיים / סמי-סטטיים (לפני :id) ---
router.get("/roots", h(controller.getRoots));
router.get("/by/fullSlug/:fullSlug", h(controller.getByFullSlug));

// --- מסלולים עם :id (בלי רג׳קס; נבצע ולידציה בתוך הקונטרולר) ---
router.get("/:id/children", h(controller.getChildren));
router.get("/:id/tree", h(controller.getTreeFrom));

// --- רשימה כללית ---
router.get("/", h(controller.list));

// --- יצירה (עם העלאת אייקון + ולידציה) ---
router.post(
  "/",
  upload.single("icon"),
  (req, _res, next) => {
    if (req.file) req.body.icon = `/uploads/icons/${req.file.filename}`;
    next();
  },
  validate(createCategorySchema),
  h(controller.create)
);

// --- שליפה בודדת / עדכון / מחיקה ---
router.get("/:id", h(controller.get));
router.put(
  "/:id",
  upload.single("icon"),
  (req, _res, next) => {
    if (req.file) req.body.icon = `/uploads/icons/${req.file.filename}`;
    next();
  },
  validate(updateCategorySchema),
  h(controller.update)
);
router.patch(
  "/:id",
  upload.single("icon"),
  (req, _res, next) => {
    if (req.file) req.body.icon = `/uploads/icons/${req.file.filename}`;
    next();
  },
  validate(updateCategorySchema),
  h(controller.update)
);
router.delete("/:id", h(controller.remove));

export default router;

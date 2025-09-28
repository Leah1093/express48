import express from "express";
import { CategoryController } from "../controllers/categoryController.js";
import { validate } from "../middlewares/validate.js";
import { createCategorySchema, updateCategorySchema } from "../validations/categorySchemas.js";
import { upload } from "../middlewares/upload.js";

const router = express.Router();
const controller = new CategoryController();

// יצירת קטגוריה
// router.post("/", validate(createCategorySchema), controller.create);

// יצירת קטגוריה עם אייקון בקריאה אחת
// router.post("/", upload.single("icon"), controller.create);
router.post("/",upload.single("icon"),
  (req, res, next) => { req.file && (req.body.icon == `/uploads/icons/${req.file.filename}`); next(); },
  validate(createCategorySchema),
  controller.create
);


// רשימת קטגוריות
router.get("/", controller.list);

// שליפת קטגוריה
router.get("/:id", controller.get);

// עדכון קטגוריה
// router.put("/:id", validate(updateCategorySchema), controller.update);
router.put("/:id", upload.single("icon"), validate(updateCategorySchema), controller.update);


// מחיקת קטגוריה
router.delete("/:id", controller.remove);

// העלאת אייקון לקטגוריה
// router.post("/:id/icon", upload.single("icon"), controller.uploadIcon);


export default router;

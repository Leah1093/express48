import { Router } from "express";
import { uploadSingleImage } from "../middlewares/uploadImage.middleware.js";
import { uploadImageController } from "../controllers/uploadController.js";

const router = Router();

router.post("/image", uploadSingleImage, uploadImageController);

export default router;

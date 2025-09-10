import express from 'express';
import { ProductController } from '../controllers/productController.js';
const router = express.Router();
const controller = new ProductController();

router.get('/', controller.getAllProducts);
router.get('/:slug', controller.getProductsBySlug);

export default router;

import express from 'express';
import {
  getCart,
  addToCart,
  removeFromCart,
  clearCart
} from '../controllers/cartController.js';
import { verifyToken } from '../middlewares/authMiddleware.js'; // אם את משתמשת באימות

const router = express.Router();

router.get('/', verifyToken, getCart);
router.post('/add', verifyToken, addToCart);
router.post('/remove', verifyToken, removeFromCart);
router.post('/clear', verifyToken, clearCart);

export default router;

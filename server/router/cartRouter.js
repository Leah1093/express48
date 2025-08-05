import express from 'express';
import {
  getCart,
  addToCart,
  removeFromCart,
  clearCart
} from '../controllers/cartController.js';
import { authCookieMiddleware } from "../middlewares/authCookieMiddleware.js";

const router = express.Router();

router.get('/', authCookieMiddleware, getCart);
router.post('/add', authCookieMiddleware, addToCart);
router.delete('/remove', authCookieMiddleware, removeFromCart);
router.delete('/clear', authCookieMiddleware, clearCart);

export default router;

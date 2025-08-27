import express from 'express';
import {
  getCart,
  addToCart,
  removeFromCart,
  clearCart,
  removeProductCompletely,
  mergeLocalCart,
  updateItemQuantity
} from '../controllers/cartController.js';
import { authCookieMiddleware } from "../middlewares/authCookie.middleware.js";

const router = express.Router();

router.get('/', authCookieMiddleware, getCart);
router.post('/add', authCookieMiddleware, addToCart);
router.delete('/remove', authCookieMiddleware, removeFromCart);
router.delete('/clear', authCookieMiddleware, clearCart);
router.delete('/remove-completely', authCookieMiddleware, removeProductCompletely);
router.post('/merge',authCookieMiddleware, mergeLocalCart);
router.put("/update-quantity", authCookieMiddleware, updateItemQuantity);


export default router;

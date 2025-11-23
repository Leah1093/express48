import express from 'express';
import {
  getCart,
  addToCart,
  removeFromCart,
  clearCart,
  removeProductCompletely,
  mergeLocalCart,
  updateItemQuantity,
  toggleSelected,
  toggleSelecteAll
} from '../controllers/cartController.js';
import { authMiddleware } from "../middlewares/auth.js";

const router = express.Router();

router.get('/', authMiddleware, getCart);
router.post('/add', authMiddleware, addToCart);
router.delete('/remove', authMiddleware, removeFromCart);
router.delete('/clear', authMiddleware, clearCart);
router.delete('/remove-completely', authMiddleware, removeProductCompletely);
router.post('/merge',authMiddleware, mergeLocalCart);
router.put("/update-quantity", authMiddleware, updateItemQuantity);
router.patch("/item/:itemId/selected",authMiddleware, toggleSelected);
router.patch("/select-all",authMiddleware,toggleSelecteAll);



export default router;
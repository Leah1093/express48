import { CartService } from '../service/cartService.js';
const cartService = new CartService();

export const getCart = async (req, res) => {
  try {
    const userId = req.user.userId;
    const cart = await cartService.getCart(userId);
    res.json(cart);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const addToCart = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { productId, quantity } = req.body;
    const cart = await cartService.addToCart(userId, productId, quantity);
    res.json(cart);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const removeFromCart = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { productId } = req.body;
    const cart = await cartService.removeFromCart(userId, productId);
    res.json(cart);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const removeProductCompletely = async (req, res) => {
  try {
    const userId = req.user.userId; 
    const { productId } = req.body;

    const updatedCart = await cartService.removeProductCompletely(userId, productId);
    res.status(200).json(updatedCart);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const clearCart = async (req, res) => {
  try {
    const userId = req.user.userId;
    const cart = await cartService.clearCart(userId); 
    res.json(cart);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
export const mergeLocalCart = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const localItems = req.body.items; // [{ productId, quantity }]
     console.log("📥 קיבלנו בקשה למיזוג עגלה:", req.body);
    const mergedCart = await cartService.mergeLocalCart(userId, localItems);
    res.json(mergedCart);
  } catch (err) {
    next(err);
  }
};
export const updateItemQuantity = async (req, res) => {
  try {
    const userId = req.user.userId; // מה־JWT
    const { productId, quantity } = req.body;
    const updatedCart = await cartService.updateItemQuantity(userId,productId,quantity);
    res.status(200).json(updatedCart);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


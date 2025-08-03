import { CartService } from '../service/cartService.js';
const cartService = new CartService();

export const getCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const cart = await cartService.getCart(userId);
    res.json(cart);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const addToCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const { productId, quantity } = req.body;
    const cart = await cartService.addToCart(userId, productId, quantity);
    res.json(cart);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const removeFromCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const { productId } = req.body;
    const cart = await cartService.removeFromCart(userId, productId);
    res.json(cart);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const clearCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const cart = await cartService.clearCart(userId);
    res.json(cart);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

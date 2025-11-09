import { CartService } from '../service/cartService.js';
const cartService = new CartService();

export const getCart = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const cart = await cartService.getCart(userId);
    res.json(cart);
  } catch (err) {
    next(err);
  }
};

export const addToCart = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { productId,variationId,quantity } = req.body;
    console.log("productId:", productId,"variationId",variationId, "quantity:", quantity);
    const cart = await cartService.addToCart(userId, productId,variationId,quantity);
    res.json({ items: cart.items });
  } catch (err) {
    next(err);
  }
};

export const removeFromCart = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { productId } = req.body;
    const cart = await cartService.removeFromCart(userId, productId);
    res.json(cart);
  } catch (err) {
    next(err);
  }
};

export const removeProductCompletely = async (req, res, next) => {
  try {
    const userId = req.user.userId; 
    const { productId,variationId = null  } = req.body;

    const updatedCart = await cartService.removeProductCompletely(userId, productId,variationId);
    res.status(200).json(updatedCart);
  } catch (err) {
    next(err);
  }
};

export const clearCart = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const cart = await cartService.clearCart(userId);
    res.json(cart);
  } catch (err) {
    next(err);
  }
};
export const mergeLocalCart = async (req, res, next) => {
  console.log("📥 קיבלנו בקשה למיזוג עגלה:");

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
export const updateItemQuantity = async (req, res, next) => {
  try {
    const userId = req.user.userId; // מה־JWT
    const { productId,variationId, quantity } = req.body;
     console.log("userId:", userId);
    console.log("body:", req.body);
    const updatedCart = await cartService.updateItemQuantity(userId,productId,  variationId || null,quantity);
    res.status(200).json(updatedCart);
  } catch (err) {
    next(err);
  }
};

export const toggleSelected = async (req, res, next) => {
  try {
    const { itemId } = req.params;
    const { selected } = req.body; // true/false
    const cart = await cartService.toggleItemSelected(req.user.userId, itemId, selected);
    res.json(cart);
  } catch (err) {
    next(err);
  }
};

export const toggleSelecteAll = async (req, res, next) => {
  try {
    const { selected } = req.body; // true/false
    const cart = await cartService.toggleSelectAll(req.user.userId, selected);
    res.json(cart);
  } catch (err) {
    next(err);
  }
}





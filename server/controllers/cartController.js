import { CartService } from "../services/cartService.js";

const cartService = new CartService();

export const getCart = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const cartResponse = await cartService.getCart(userId);
    res.json(cartResponse);
  } catch (err) {
    next(err);
  }
};

export const addToCart = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { productId, quantity,variationId } = req.body;

    console.log("productId:", productId, "quantity:", quantity , variationId);

    const cartResponse = await cartService.addToCart(
      userId,
      productId,
      quantity,
      variationId || null
    );

    // ה-service כבר מחזיר CartResponse מלא
    res.json(cartResponse);
  } catch (err) {
    next(err);
  }
};

export const removeFromCart = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { productId } = req.body;

    const cartResponse = await cartService.removeFromCart(userId, productId);
    res.json(cartResponse);
  } catch (err) {
    next(err);
  }
};

export const removeProductCompletely = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { productId } = req.body;

    const cartResponse = await cartService.removeProductCompletely(
      userId,
      productId
    );

    res.status(200).json(cartResponse);
  } catch (err) {
    next(err);
  }
};

export const clearCart = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const cartResponse = await cartService.clearCart(userId);
    res.json(cartResponse);
  } catch (err) {
    next(err);
  }
};

export const mergeLocalCart = async (req, res, next) => {
  console.log("📥 קיבלנו בקשה למיזוג עגלה:", req.body);

  try {
    const userId = req.user.userId;
    const localItems = req.body.items; // [{ productId, quantity, selected? }]

    const cartResponse = await cartService.mergeLocalCart(userId, localItems);
    res.json(cartResponse);
  } catch (err) {
    next(err);
  }
};

export const updateItemQuantity = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { productId, quantity } = req.body;

    console.log("userId:", userId);
    console.log("body:", req.body);

    const cartResponse = await cartService.updateItemQuantity(
      userId,
      productId,
      quantity
    );

    res.status(200).json(cartResponse);
  } catch (err) {
    next(err);
  }
};

export const toggleSelected = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { itemId } = req.params;
    const { selected } = req.body; // true/false

    const cartResponse = await cartService.toggleItemSelected(
      userId,
      itemId,
      selected
    );

    res.json(cartResponse);
  } catch (err) {
    next(err);
  }
};

export const toggleSelecteAll = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { selected } = req.body; // true/false

    const cartResponse = await cartService.toggleSelectAll(
      userId,
      selected
    );

    res.json(cartResponse);
  } catch (err) {
    next(err);
  }
};

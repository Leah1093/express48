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
    // מיזוג: שמור גם affiliateRef אם קיים, וגם סדר פרמטרים נכון
    const {
      productId,
      variationId,
      quantity,
      affiliateRef = null, // 👈 מגיע מהפרונט (אם יש ref)
    } = req.body;

    console.log(
      "productId:",
      productId,
      "variationId",
      variationId,
      "quantity:",
      quantity,
      "affiliateRef:",
      affiliateRef
    );

    // מיזוג: סדר פרמטרים נכון, תמיכה ב-affiliateRef, החזרת CartResponse מלא
    const cartResponse = await cartService.addToCart(
      userId,
      productId,
      variationId,
      quantity,
      affiliateRef // 👈 מועבר לסרביס
    );

    res.json(cartResponse);
  } catch (err) {
    next(err);
  }
};

export const removeFromCart = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { productId, variationId } = req.body;

    const cartResponse = await cartService.removeFromCart(userId, productId,variationId ?? null);
    res.json(cartResponse);
  } catch (err) {
    next(err);
  }
};

export const removeProductCompletely = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    // מיזוג: תמיכה ב-variationId=null, החזרת CartResponse מלא
    const { productId, variationId = null } = req.body;

    const cartResponse = await cartService.removeProductCompletely(
      userId,
      productId,
      variationId
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
    // מיזוג: סדר פרמטרים נכון, החזרת CartResponse מלא
    const { productId, quantity, variationId } = req.body;

    console.log("userId:", userId);
    console.log("body:", req.body);

    const cartResponse = await cartService.updateItemQuantity(
      userId,
      productId,
      quantity,
      variationId ?? null
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

import { Cart } from '../models/cart.js';
import { cartQueries } from '../mongoQueries/cartQueries.js';

export class CartService {
  async getCart(userId) {
    const cart = await Cart.findOne(cartQueries.findByUserId(userId)).populate('items.productId');
    return cart || { userId, items: [] };
  }

  async addToCart(userId, productId, quantity = 1) {
    let cart = await Cart.findOne(cartQueries.findByUserId(userId));
    if (!cart) {
      cart = new Cart({ userId, items: [{ productId, quantity }] });
    } else {
      const existingItem = cart.items.find(item => item.productId.toString() === productId);
      if (existingItem) {
        existingItem.quantity += quantity;
      } else {
        cart.items.push({ productId, quantity });
      }
    }
    await cart.save();
    return cart;
  }

  async removeFromCart(userId, productId) {
    // שליפת העגלה של המשתמש
    const cart = await Cart.findOne(cartQueries.findByUserId(userId));
    if (!cart) {
      throw new Error('Cart not found');
    }
    // מציאת המוצר בעגלה לפי productId
    const item = cart.items.find(item => item.productId.toString() === productId);
    // אם לא נמצא פריט מתאים - נחזיר את העגלה כמו שהיא
    if (!item) {
      return cart;
    }
    if (item.quantity > 1) {
      // אם יש יותר מאחד - נוריד באחד
      item.quantity -= 1;
    } else {
      // אם יש רק אחד - נסיר את הפריט מהעגלה
      cart.items = cart.items.filter(item => item.productId.toString() !== productId);
    }
    // שמירה של השינויים בעגלה
    await cart.save();
    return cart;
  }
  
  async removeProductCompletely(userId, productId) {
  // שליפת העגלה של המשתמש
  const cart = await Cart.findOne(cartQueries.findByUserId(userId));
  if (!cart) {
    throw new Error('Cart not found');
  }

  // סינון כל הפריטים שאינם המוצר הרצוי (כלומר - הסרה מוחלטת)
  cart.items = cart.items.filter(item => item.productId.toString() !== productId);

  // שמירה של השינויים בעגלה
  await cart.save();
  return cart;
}


  async clearCart(userId) {
    const cart = await Cart.findOne(cartQueries.findByUserId(userId));
    if (cart) {
      cart.items = [];
      await cart.save();
    }
    return cart;
  }


  async mergeLocalCart(userId, localItems) {
    let cart = await Cart.findOne(cartQueries.findByUserId(userId));

    if (!cart) {
      // אם לא קיימת עגלה – ניצור עגלה חדשה עם הפריטים המקומיים
      cart = new Cart({
        userId,
        items: localItems.map(item => ({
          productId: item.productId,
          quantity: item.quantity
        }))
      });
    } else {
      // עגלה קיימת – נבצע מיזוג
      localItems.forEach(localItem => {
        const existingItem = cart.items.find(item =>
          item.productId.toString() === localItem.productId
        );

        if (existingItem) {
          existingItem.quantity += localItem.quantity;
        } else {
          cart.items.push({
            productId: localItem.productId,
            quantity: localItem.quantity
          });
        }
      });
    }

    await cart.save();
    return cart;
  }

}

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
    const cart = await Cart.findOne(cartQueries.findByUserId(userId));
    if (!cart) throw new Error('Cart not found');
    const itemExists = cart.items.some(item => item.productId.toString() === productId);
    if (!itemExists) {
      // במקום לזרוק שגיאה, פשוט נחזיר את העגלה כמו שהיא
      return cart;
    }
    cart.items = cart.items.filter(item => item.productId.toString() !== productId);
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
}

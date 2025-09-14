import { Cart } from '../models/cart.js';
import { Product } from "../models/product.js"; // ודאי את הנתיב הנכון
import { cartQueries } from '../mongoQueries/cartQueries.js';
const toIdStr = (x) => (typeof x === 'object' && x?._id ? String(x._id) : String(x));

export class CartService {
  async getCart(userId) {
    const cart = await Cart.findOne(cartQueries.findByUserId(userId)).populate('items.productId');
    return cart || { userId, items: [] };
  }

  async addToCart(userId, productId, quantity = 1) {
    let cart = await Cart.findOne(cartQueries.findByUserId(userId));
    if (!cart) {
        const prod = await Product.findById(productId).select('price').lean();
    if (!prod) throw new Error('Product not found');
      cart = new Cart({ userId, items: [{ productId, quantity,unitPrice: prod.price.amount }] });
    } else {
      const existingItem = cart.items.find(item => item.productId.toString() === productId.toString());
      if (existingItem) {
        existingItem.quantity += quantity;
      } else {
         const prod = await Product.findById(productId).select('price').lean();
      if (!prod) throw new Error('Product not found');
        cart.items.push({ productId, quantity, unitPrice: prod.price.amount });
      }
    }
    await cart.save();
    // console.log('Saved cart:', JSON.stringify(cart, null, 2));
    return await  Cart.findOne({ userId }).populate("items.productId", "title price images");
  }
//   async addToCart(userId, productId, quantity = 1) {
//   const cart = await Cart.findOneAndUpdate(
//     { userId, 'items.productId': productId },
//     {
//       $inc: { 'items.$.quantity': quantity }, // אם הפריט קיים – תגדיל כמות
//     },
//     { new: true }
//   );

//   if (cart) return cart;

//   // אם לא קיים פריט כזה – הוסף חדש
//   return await Cart.findOneAndUpdate(
//     { userId },
//     { $push: { items: { productId, quantity } } },
//     { upsert: true, new: true }
//   );
// }


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
    return await Cart.findOne({ userId }).populate(
    "items.productId",
    "title price images"
  );
  }


  async clearCart(userId) {
    const cart = await Cart.findOne(cartQueries.findByUserId(userId));
    if (cart) {
      cart.items = [];
      await cart.save();
    }
    return cart;
  }


  // async mergeLocalCart(userId, localItems) {
  //   let cart = await Cart.findOne(cartQueries.findByUserId(userId));

  //   if (!cart) {
  //      const itemsWithPrice = [];
  //   for (const item of localItems) {
  //     const prod = await Product.findById(item.productId).select('price').lean();
  //     if (!prod) throw new Error(`Product not found: ${item.productId}`);
  //     itemsWithPrice.push({
  //       productId: item.productId,
  //       quantity: item.quantity,
  //       unitPrice: prod.price
  //     });
  //   }

  //     // // אם לא קיימת עגלה – ניצור עגלה חדשה עם הפריטים המקומיים
  //     // cart = new Cart({
  //     //   userId,
  //     //   items: localItems.map(item => ({
  //     //     productId: item.productId,
  //     //     quantity: item.quantity
  //     //   }))
  //     // });
  //     // console.log("🆕 created new cart with items:", cart.items.map(i => ({
  //     //   productId: toIdStr(i.productId), quantity: i.quantity
  //     // })));
  //   } else {
  //     // עגלה קיימת – נבצע מיזוג
  //     localItems.forEach(localItem => {
  //       console.log("🟡 בודק פריט לפני מיזוג:", {
  //         localProductId: localItem.productId,
  //         localQuantity: localItem.quantity
  //       });

  //       const existingItem = cart.items.find(item =>
  //         item.productId.toString() === localItem.productId
  //       );

  //       console.log("🔍 נמצא בעגלה?:", !!existingItem, existingItem ? {
  //         existingProductId: existingItem.productId,
  //         existingQuantity: existingItem.quantity
  //       } : null);

  //       if (existingItem) {
  //         existingItem.quantity += localItem.quantity;
  //         console.log("🟢 עודכן פריט קיים:", {
  //           productId: existingItem.productId,
  //           added: localItem.quantity,
  //           newQuantity: existingItem.quantity
  //         });
  //       } else {
  //         cart.items.push({
  //           productId: localItem.productId,
  //           quantity: localItem.quantity
  //         });
  //         console.log("🔵 נוסף פריט חדש:", {
  //           productId: localItem.productId,
  //           quantity: localItem.quantity
  //         });
  //       }
  //     });

  //     console.log("✅ מצב סופי של העגלה אחרי מיזוג:", cart.items.map(item => ({
  //       productId: item.productId,
  //       quantity: item.quantity
  //     })));

  //     await cart.save();
  //     return cart;
  //   }

  // }
  

  async  mergeLocalCart(userId, localItems = []) {
  let cart = await Cart.findOne(cartQueries.findByUserId(userId));

  // נרמול קלט
  const normalized = (Array.isArray(localItems) ? localItems : [])
    .map(it => ({ productId: toIdStr(it.productId), quantity: Number(it.quantity ?? 1),  selected: Boolean(it.selected) }))
    .filter(it => it.productId && it.quantity > 0);

  // באצ' מחירים מראש (יעיל ומהיר)
  const ids = [...new Set(normalized.map(it => it.productId))];
  const prods = await Product.find({ _id: { $in: ids } }).select('price').lean();
  const priceMap = Object.fromEntries(prods.map(p => [String(p._id), Number(p.price.amount)]));

  if (!cart) {
    // ✅ עגלה חדשה: לבנות items עם unitPrice, לשמור ולהחזיר
    const itemsWithPrice = normalized.map(it => {
      const price = priceMap[it.productId];
      if (price == null) throw new Error(`Product not found: ${it.productId}`);
      return { productId: it.productId, quantity: it.quantity, unitPrice: price,selected: it.selected ?? false };
    });

    cart = new Cart({ userId, items: itemsWithPrice });
    await cart.save();
    return cart;
  }

  // ✅ עגלה קיימת: מיזוג פריטים + השלמת unitPrice כשצריך
  for (const it of normalized) {
    const existing = cart.items.find(row => String(row.productId) === it.productId);
    if (existing) {
      if (existing.unitPrice == null) {
        const price = priceMap[it.productId];
        if (price == null) throw new Error(`Product not found: ${it.productId}`);
        existing.unitPrice = price;
      }
      existing.quantity += it.quantity;
      // עדכון מצב בחירה (שומר TRUE אם אחד מהם נבחר)
      if (it.selected) existing.selected = true;
    } else {
      const price = priceMap[it.productId];
      if (price == null) throw new Error(`Product not found: ${it.productId}`);
      cart.items.push({ productId: it.productId, quantity: it.quantity, unitPrice: price,selected: it.selected ?? false });
    }
  }

  await cart.save();
  return cart;
}

  async updateItemQuantity(userId, productId, quantity) {
    const cart = await Cart.findOne(cartQueries.findByUserId(userId));
    if (!cart) {
      throw new Error("Cart not found");
    }
    const item = cart.items.find((i) => i.productId.toString() === productId.toString());
    if (!item) {
      throw new Error("Product not found in cart");
    }
    item.quantity = quantity; // ⬅️ עדכון הכמות
    await cart.save();

   return await Cart.findOne({ userId }).populate(
    "items.productId",
    "title price images"
  );
  }

  async toggleItemSelected(userId, itemId, selected) {
    console.log("👉 מה התקבל:", itemId, selected);

    const cart = await Cart.findOneAndUpdate(
      { userId: userId, "items._id": itemId },
      { $set: { "items.$.selected": selected } },
      { new: true }
    ).populate("items.productId");
    if (!cart) {
    throw new Error("Cart not found or item not found");
  }else{
    console.log("cart", cart);
  }


    return cart;
  }


async toggleSelectAll(userId, selected) {
  const cart = await Cart.findOneAndUpdate(
    { userId },
    { $set: { "items.$[].selected": selected } }, // מעדכן את כולם בבת אחת
    { new: true }
  ).populate("items.productId");

  return cart;
}

}

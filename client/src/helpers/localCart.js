
export const getLocalCart = () => {
  return JSON.parse(localStorage.getItem('cart')) || [];
};

export const saveLocalCart = (cart) => {
  localStorage.setItem('cart', JSON.stringify(cart));
};

export const addToLocalCart = (product, quantity = 1) => {
  if (!product || !product._id) {
    console.error("❌ מוצר לא תקין שנשלח ל־addToLocalCart", product);
    return;
  }

  // שליפת העגלה מה-localStorage, גם אם ריקה
  const cart = getLocalCart(); // תמיד מחזיר מערך – אפילו ריק []
  // חיפוש אם המוצר כבר קיים בעגלה
  const index = cart.findIndex(item =>
    item.product && item.product._id === product._id
  );
  if (index >= 0) {
    // אם המוצר כבר קיים בעגלה – נעלה את הכמות
    cart[index].quantity += quantity;
  } else {
    // אם העגלה ריקה או שהמוצר לא קיים – נוסיף אותו
    cart.push({ product, quantity });
  }
  // נשמור את העגלה החדשה
  saveLocalCart(cart);
};


export const removeFromLocalCart = (productId) => {
  const cart = getLocalCart();
  const index = cart.findIndex(item => item.productId === productId);

  if (index >= 0) {
    if (cart[index].quantity > 1) {
      cart[index].quantity -= 1;
    } else {
      cart.splice(index, 1);
    }
    saveLocalCart(cart);
  }
};

export const removeProductCompletelyFromLocalCart = (productId) => {
  const cart = getLocalCart();
  const updatedCart = cart.filter(item =>
    (item.product && item.product._id !== productId) &&
    (item.productId !== productId) // במידה ויש פורמט אחר
  );
  saveLocalCart(updatedCart);
};




export const clearLocalCart = () => {
  localStorage.removeItem('cart');
};

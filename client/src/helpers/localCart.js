
export const getLocalCart = () => {
  const cart = localStorage.getItem('cart');
  try {
    return cart ? JSON.parse(cart) : [];
  } catch (e) {
    console.error("❌ Error parsing local cart:", e);
    return [];
  }
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

export const updateItemQuantityInLocalCart = (productId, quantity) => {
  if (!productId || typeof quantity !== 'number' || quantity < 1) {
    console.error("❌ ערכי עדכון כמות לא תקינים", { productId, quantity });
    return;
  }

  const cart = getLocalCart();

  // מוצאים את המוצר
  const index = cart.findIndex(item =>
    (item.product && item.product._id === productId) ||
    item.productId === productId
  );

  if (index >= 0) {
    cart[index].quantity = quantity; // עדכון הכמות
    saveLocalCart(cart);
  } else {
    console.warn(`⚠️ מוצר עם ID ${productId} לא נמצא בעגלה`);
  }
};


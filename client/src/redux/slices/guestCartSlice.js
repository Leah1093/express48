import { createSlice } from '@reduxjs/toolkit';
import { getLocalCart, saveLocalCart, clearLocalCart as clearStorage } from "../../helpers/localCart";

const initialState = getLocalCart(); // נטען את העגלה מה-localStorage

const guestCartSlice = createSlice({
  name: 'guestCart',
  initialState,
  reducers: {
    // addGuestItem: (state, action) => {
    //   const { product, variation = null, quantity = 1 } = action.payload;
    //   console.log("🚀 addGuestItem", { product, variation, quantity });
    //   const index = state.findIndex(item => item.productId._id === product._id &&
    //     (item.variationId || null) === (variation?._id || null)
    //   );

    //   if (index >= 0) {
    //     // אם כבר יש אותו מוצר+וריאציה → מוסיפים כמות
    //     state[index].quantity += quantity;
    //   } else {
    //     const snapshot = {
    //       attributes: variation?.attributes || {},   // מאפייני הוריאציה
    //       images: variation?.images?.length ? variation.images : product.images,
    //       price: variation?.price?.amount || product.price.amount,
    //       discount: variation?.discount || product.discount || null,
    //     };
    //     state.push({
    //       productId: product,
    //       variationId: variation?._id || null,
    //       quantity,
    //       unitPrice: snapshot.price,
    //       snapshot,
    //       selected: false
    //     });
    //   }

    //   saveLocalCart(state); // עדכון localStorage
    // },
    addGuestItem: (state, action) => {
  const { product, variation = null, variationId = null, quantity = 1 } = action.payload;

  // אם קיבלתי variationId בלי אובייקט → נחפש אותו בתוך product.variations
  const selectedVariation =
    variation ||
    (variationId ? product.variations?.find(v => v._id === variationId) : null);

  // לבדוק אם כבר יש אותו מוצר + אותה וריאציה בעגלה
  const index = state.findIndex(item =>
    item.productId._id === product._id &&
    (item.variationId || null) === (selectedVariation?._id || variationId || null)
  );

  if (index >= 0) {
    // אם כבר קיים → רק להגדיל כמות
    state[index].quantity += quantity;
  } else {
    // לבנות snapshot
    const snapshot = {
      attributes: selectedVariation?.attributes || {},
      images: selectedVariation?.images?.length ? selectedVariation.images : product.images,
      price: selectedVariation?.price?.amount || product.price.amount,
      discount: selectedVariation?.discount || product.discount || null,
    };

    // להכניס לעגלה
    state.push({
      productId: product,                         // כל המוצר
      variationId: selectedVariation?._id || variationId || null, // מזהה הוריאציה
      quantity,
      unitPrice: snapshot.price,
      snapshot,
      selected: true  // ✅ ברירת מחדל - מוצר חדש נבחר
    });
  }

  saveLocalCart(state); // עדכון localStorage
},
    

    removeGuestItem: (state, action) => {
      const {productId, variationId=null } = action.payload;
     const index = state.findIndex(item => item.productId._id === productId &&
        (item.variationId || null) === (variationId || null)
      );

      if (index >= 0) {
        if (state[index].quantity > 1) {
          state[index].quantity -= 1;
        } else {
          state.splice(index, 1);
        }
      }

      saveLocalCart(state);
    },

    removeGuestProductCompletely: (state, action) => {
      const {productId, variationId = null} = action.payload;

      const updatedCart = state.filter(item => {
    const id = item?.productId?._id?.toString?.() || item?.productId?.toString?.();
    const sameProduct = id === productId?.toString();
    const sameVariation =
      (item.variationId?.toString?.() || null) === (variationId?.toString() || null);

    // נשאיר רק פריטים שלא תואמים *גם* מוצר וגם וריאציה
    return !(sameProduct && sameVariation);
  });

      saveLocalCart(updatedCart);
      return updatedCart;
    },

    clearGuestCart: () => {
      clearStorage();
      return [];
    },
    // ⭐ חדש: עדכון כמות ישירה לפי קלט
    setGuestItemQuantity: (state, action) => {
      const { productId,variationId = null, quantity } = action.payload;

      // חיפוש מוצר לפי productId + variationId
  const index = state.findIndex(item =>
    (item.productId?._id?.toString?.() || item.productId?.toString?.()) === productId.toString() &&
    (item.variationId?.toString?.() || null) === (variationId?.toString() || null)
  );

      if (index === -1) {
        // לא קיים בעגלה – לא עושים כלום (או שאפשר להחליט להוסיף אם quantity>0)
        return;
      }

      if (quantity <= 0) {
        // הסרה מלאה אם ביקשו 0 או פחות
        state.splice(index, 1);
      } else {
        state[index].quantity = quantity;
      }
      saveLocalCart(state);
    },

    loadGuestCart: () => {
      return getLocalCart();
    },

    toggleGuestItemSelected: (state, action) => {
      const { productId, selected } = action.payload;
      const item = state.find((it) => it.productId._id === productId);
      if (item) {
        item.selected = selected;
      }
      saveLocalCart(state); // ⬅️ תמיד לשמור אחרי עדכון
    },

    // בתוך ה-slice של ה-cart לאורח
    toggleGuestSelectAll: (state, action) => {
      const selected = action.payload; // true = לבחור הכל, false = לנקות הכל
      state.forEach((item) => {
        item.selected = selected;
      });
      saveLocalCart(state); // ⬅️ תמיד לשמור אחרי עדכון
    },

  },
});

export const { addGuestItem, removeGuestItem, clearGuestCart, loadGuestCart, removeGuestProductCompletely, setGuestItemQuantity, toggleGuestItemSelected, toggleGuestSelectAll } = guestCartSlice.actions;
export default guestCartSlice.reducer;

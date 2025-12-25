// import { createAsyncThunk } from '@reduxjs/toolkit';
// import * as api from '../cartAPI';
// import { mergeCartService } from "../../services/cartService";
// import axios from 'axios';


// export const loadCart = createAsyncThunk('cart/', async () => {
//   const res = await api.fetchCart();
//   return res.data.items;
// });

// export const addItemAsync = createAsyncThunk('cart/addItem', async ({ productId,variationId = null,  quantity = 1 }) => {
//   const res = await api.addToCart(productId,variationId,quantity);
//   return res.data.items;
// });

// export const removeItemAsync = createAsyncThunk('cart/removeItem', async (productId) => {
//   const res = await api.removeFromCart(productId);
//   return res.data.items;
// });

// export const clearCartAsync = createAsyncThunk('cart/clearCart', async () => {
//   const res = await api.clearCart();
//   return res.data.items;
// });

// export const  removeProductCompletelyThunk = createAsyncThunk('cart/removeCompletely',
//  async ({productId,variationId = null}, { rejectWithValue }) => {
//       // לוג של הפרמטרים
//   //  console.log('🚀 removeProductCompletelyThunk', { productId, source, stack: new Error().stack });
//     try {
//       const res = await api.removeProductCompletely(productId,variationId);
//        return res.data.items;
//     } catch (err) {
//       return rejectWithValue(err.response.data);
//     }
//   }
// );

// export const updateItemQuantityThunk = createAsyncThunk(
//   "cart/updateQuantity",
//   async ({ productId,variationId = null, quantity }, { rejectWithValue }) => {
//     try {
//       console.log("variationId",variationId);  
//       const res = await api.updateItemQuantity(productId,variationId, quantity);
//       return res.data.items;
//     } catch (err) {
//       return rejectWithValue(err.response.data);
//     }
//   }
// );




// export const mergeCartThunk = createAsyncThunk(
//   'cart/mergeGuestCart',
//   async ({ userId, guestCart }, { rejectWithValue }) => {
//     try {
//       console.log("🔁 mergeCartThunk התחיל עם:", userId, guestCart); // << כאן לשים
//       const mergedCart = await mergeCartService(userId, guestCart);
//       localStorage.removeItem("cart");
//       return mergedCart;
//     } catch (error) {
//       console.error("❌ שגיאה במיזוג עגלה:", error);
//       return rejectWithValue(error.response?.data || "שגיאה כללית");
//     }
//   }
// );
// const API_URL = import.meta.env.VITE_API_URL;

// export const toggleItemSelectedThunk = createAsyncThunk(
//   "cart/toggleItemSelected",
//   async ({ itemId, selected }, { rejectWithValue }) => {
//     try {
//       const res = await axios.patch(
//         `${API_URL}/cart/item/${itemId}/selected`,
//         { selected },
//         { withCredentials: true }
//       );
//         console.log("✅ Response מהשרת:", res.data);
//       return res.data.items;
//     } catch (err) {
//       return rejectWithValue(err.response?.data || err.message);
//     }
//   }
// );
// export const toggleSelectAllThunk = createAsyncThunk(
//   "cart/toggleSelectAll",
//   async (selected, { rejectWithValue }) => {
//     try {
//       const res = await axios.patch(
// <<<<<<< HEAD
//         `${API_URL}/cart/select-all`,
// =======
//         `https://api.express48.com/cart/select-all`,
// >>>>>>> 09f9d3e93b71ea13f78e0f5427133a8dd3e1f9d4
//         { selected },
//         { withCredentials: true }
//       );
//       return res.data;
//     } catch (err) {
//       return rejectWithValue(err.response?.data || err.message);
//     }
//   }
// );




// src/redux/thunks/cartThunks.js
import { createAsyncThunk } from '@reduxjs/toolkit';
import * as api from '../cartAPI';
import { mergeCartService } from "../../services/cartService";
import axios from 'axios';

// ⭐ חדש: לייבא את הפונקציה שמחזירה את ה-ref השמור
import { getSavedReferral } from "../../lib/affiliateRef";

export const loadCart = createAsyncThunk('cart/', async () => {
  const res = await api.fetchCart();
  return res.data.items;
});

export const addItemAsync = createAsyncThunk(
  'cart/addItem',
  async ({ productId, variationId = null, quantity = 1 }) => {
    // ⭐ חדש: לקרוא את ה-ref מה-localStorage (אם יש)
    const affiliateRef = getSavedReferral();

    // 👇 וכאן אנחנו שולחים אותו ל-API
    const res = await api.addToCart(productId, variationId, quantity, affiliateRef);
    return res.data.items;
  }
);

// שאר ה-thunks שלך נשארים כמו שהם ↓↓↓

export const removeItemAsync = createAsyncThunk(
  'cart/removeItem',
  async (productId) => {
    const res = await api.removeFromCart(productId);
    return res.data.items;
  }
);

export const clearCartAsync = createAsyncThunk('cart/clearCart', async () => {
  const res = await api.clearCart();
  return res.data.items;
});

export const removeProductCompletelyThunk = createAsyncThunk(
  'cart/removeCompletely',
  async ({ productId, variationId = null }, { rejectWithValue }) => {
    try {
      const res = await api.removeProductCompletely(productId, variationId);
      return res.data.items;
    } catch (err) {
      return rejectWithValue(err.response?.data);
    }
  }
);

export const updateItemQuantityThunk = createAsyncThunk(
  'cart/updateQuantity',
  async ({ productId, variationId = null, quantity }, { rejectWithValue }) => {
    try {
      const res = await api.updateItemQuantity(productId, variationId, quantity);
      return res.data.items;
    } catch (err) {
      return rejectWithValue(err.response?.data);
    }
  }
);

export const mergeCartThunk = createAsyncThunk(
  'cart/mergeGuestCart',
  async ({ userId, guestCart }, { rejectWithValue }) => {
    try {
      const mergedCart = await mergeCartService(userId, guestCart);
      localStorage.removeItem('cart');
      return mergedCart;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'שגיאה כללית');
    }
  }
);

const API_URL = import.meta.env.VITE_API_URL;

export const toggleItemSelectedThunk = createAsyncThunk(
  'cart/toggleItemSelected',
  async ({ itemId, selected }, { rejectWithValue }) => {
    try {
      const res = await axios.patch(
        `${API_URL}/cart/item/${itemId}/selected`,
        { selected },
        { withCredentials: true }
      );
      return res.data.items;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

export const toggleSelectAllThunk = createAsyncThunk(
  'cart/toggleSelectAll',
  async (selected, { rejectWithValue }) => {
    try {
      const res = await axios.patch(
        `${API_URL}/cart/select-all`,
        { selected },
        { withCredentials: true }
      );
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

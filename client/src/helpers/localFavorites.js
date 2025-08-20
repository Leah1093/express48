

// const FAVORITES_KEY = "guest_favorites";

// export function getGuestFavorites() {
//   const data = localStorage.getItem(FAVORITES_KEY);
//   return data ? JSON.parse(data) : [];
// }

// export function addGuestFavorite(productId) {
//   const current = getGuestFavorites();
//   if (!current.includes(productId)) {
//     localStorage.setItem(FAVORITES_KEY, JSON.stringify([...current, productId]));
//   }
// }

// export function removeGuestFavorite(productId) {
//   const current = getGuestFavorites().filter(id => id !== productId);
//   localStorage.setItem(FAVORITES_KEY, JSON.stringify(current));
// }

// export function clearGuestFavorites() {
//   localStorage.removeItem(FAVORITES_KEY);
// }
const FAVORITES_KEY = "guest_favorites";

// שליפה
export function getGuestFavorites() {
    const data = localStorage.getItem(FAVORITES_KEY);
    return data ? JSON.parse(data) : [];
}

// שמירה
export function saveGuestFavorites(favorites) {
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
}

// הוספה
export function addGuestFavorite(product) {
    console.log("product in addGuestFavorite:", product);
    const current = getGuestFavorites();

    const exists = current.some(fav => fav.productId === product._id);
    if (exists) return;

    const newFavorite = {
        productId: product._id,         // לשמור גם id
        addedAt: new Date().toISOString(),
        product                        // לשמור את כל האובייקט
    };

    saveGuestFavorites([...current, newFavorite]);
}

// מחיקה
export function removeGuestFavorite(productId) {
    const current = getGuestFavorites().filter(fav => fav.productId !== productId);
    saveGuestFavorites(current);
}

// ניקוי
export function clearGuestFavorites() {
    localStorage.removeItem(FAVORITES_KEY);
}


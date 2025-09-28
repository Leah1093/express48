// queries/favoriteQueries.js

export const favoriteQueries = {
  // כל המועדפים של משתמש
  findByUserId: (userId) => ({ userId }),

  // מועדף מסוים של משתמש עבור מוצר
  findByUserAndProduct: (userId, productId) => ({ userId, productId }),

  // בדיקת קיום (זה בעצם אותו פילטר שלמעלה, אבל נוח לשם ברור)
  existsByUserAndProduct: (userId, productId) => ({ userId, productId }),
};

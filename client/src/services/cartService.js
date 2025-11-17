import axios from 'axios';

export const mergeCartService = async (userId, guestCart) => {
  if (!guestCart?.length) return;

  const formattedItems = guestCart.map(item => ({
    productId:
      item.product?._id ||
      item.product?.id ||
      item.productId, // ברירת מחדל
    quantity: item.quantity,
    selected: item.selected || false,
  }));


  const response = await axios.post(
    `${import.meta.env.VITE_API_URL || "http://localhost:8080"}/cart/merge`,
    {
      userId,
      items: formattedItems
    },
    { withCredentials: true }
  );

  return response.data;
};

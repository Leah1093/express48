import axios from 'axios';

export const mergeCartService = async (userId, guestCart) => {
  if (!guestCart?.length) return;

  const formattedItems = guestCart.map(item => ({
    productId: typeof item.product._id === 'string' ? item.product._id : item.product.id,
    quantity: item.quantity
  }));

  const response = await axios.post(
    "http://localhost:8080/cart/merge",
    {
      userId,
      localItems: formattedItems
    },
    { withCredentials: true }
  );

  return response.data;
};

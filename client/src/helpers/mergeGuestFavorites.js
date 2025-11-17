// helpers/mergeGuestFavorites.js
import axios from "axios";
import { getGuestFavorites, clearGuestFavorites } from "./localFavorites";

export async function mergeGuestFavoritesIfAny() {
  const guest = getGuestFavorites();           // [{ productId, addedAt, product? }, ...]
  if (!Array.isArray(guest) || guest.length === 0) return;

  // שולחים לשרת רק את מה שצריך: productId + addedAt
  const items = guest.map(g => ({
    productId: typeof g.productId === "object" ? g.productId._id : g.productId,
    addedAt: g.addedAt || new Date().toISOString(),
  }));

  await axios.post(`${import.meta.env.VITE_API_URL || "http://localhost:8080"}/favorites/merge`,
    { items },
    { withCredentials: true }
  );

  clearGuestFavorites(); // כדי שלא יהיה כפול אחרי המיזוג
}
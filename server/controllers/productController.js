import { Product } from '../models/product.js';

export const getAllProducts = async (req, res) => {
  try {
    const products = await Product.find({});
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: 'שגיאה בשליפת מוצרים' });
  }
};

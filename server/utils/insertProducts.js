import mongoose from 'mongoose';
import axios from 'axios';
import { Product } from "../models/Product.js";
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// כדי לזהות את הנתיב לקובץ .env שנמצא בתיקיית server
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// טוען את .env מהתיקייה שמעל utils (כלומר server)
dotenv.config({ path: path.resolve(__dirname, '../.env') });

async function run() {
  await mongoose.connect(process.env.MONGO_URI);

  // שלב 1: שליפת מוצרים מה-API
  const fetchProductsFromAPI = async () => {
    const response = await axios.get('https://fakestoreapi.com/products/category/electronics');
    return response.data;
  };

  // שלב 2: שמירה למסד
  const saveProductsToMongo = async () => {
    try {
      const products = await fetchProductsFromAPI();

      for (const p of products) {
        const mappedProduct = {
          externalId: p.id,
          title: p.title,
          price: p.price,
          description: p.description,
          category: p.category,
          image: p.image,
          rating: {
            rate: p.rating.rate,
            count: p.rating.count,
          },
        };

        await Product.create(mappedProduct);
      }

      console.log('✅ Products saved to MongoDB');
      process.exit(0);
    } catch (err) {
      console.error('❌ Error saving products:', err);
      process.exit(1);
    }
  };

  await saveProductsToMongo();
}

run();

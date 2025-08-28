import mongoose from 'mongoose';
import axios from 'axios';
import { Product } from "../models/product";
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { mockNormalizeWithAI } from "../ai/normalizeProduct.js";
//  import { mockNormalizeWithAI } from "./mock/openaiMock.js";
import { mapFakeStoreProduct } from "../mappers/fakeStoreMapper.js";


// כדי לזהות את הנתיב לקובץ .env שנמצא בתיקיית server
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// טוען את .env מהתיקייה שמעל utils (כלומר server)
dotenv.config({ path: path.resolve(__dirname, '../.env') });

async function run() {
  await mongoose.connect(process.env.MONGO_URI);

   // --- Extract ---
  // שלב 1: שליפת מוצרים מה-API
  const fetchProductsFromAPI = async () => {
    const response = await axios.get('https://fakestoreapi.com/products/category/electronics');
    return response.data;
  };

  // --- Transform + Load ---
  // שלב 2: שמירה למסד
  const saveProductsToMongo = async () => {
    try {
      const products = await fetchProductsFromAPI();

      for (const p of products) {
        const mappedProduct = mapFakeStoreProduct(p); // Transform
        

        // const normalized = await normalizeWithAI(mappedProduct);
       

        async function test() {
          const product = { title: "טלפון חדש", specs: { battery: "4000mAh" } };
          const normalized = await mockNormalizeWithAI(product);
          console.log("Normalized:", normalized);
        }

        test();


        await Product.create(mappedProduct);    // Load
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

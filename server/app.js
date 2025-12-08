import express from "express";
import cors from 'cors';
import cookieParser from 'cookie-parser';
import path from "path";
import { fileURLToPath } from "url";
import { sitemapRouter } from "./router/sitemap.router.js";

import { connectDB } from "./config/db.js";
import 'dotenv/config';
import { passwordRouter } from "./router/password.router.js";
import { entranceRouter } from "./router/entrance.router.js";
import { errorHandler } from "./middlewares/errorHandler.js";
import { googleAuthRouter } from "./router/googleAuth.router.js";
import { contactRouter } from "./router/contactRouter.js";
import { userRouter } from "./router/user.routes.js";
import { storeRouter } from "./router/store.router.js";
import cartRouter from './router/cartRouter.js';
import { storePublicRouter } from "./router/storePublic.router.js";
import passport from "passport";
import session from "express-session";
import { apiLimiter } from "./middlewares/rateLimit.middleware.js";
import './config/googleOAuth.config.js'
import productRouter from "./router/product.router.js";
import searchRouter from "./router/search.router.js";
import { sellerProductsRouter } from "./router/seller.products.router.js";
import { marketplaceRouter } from "./router/marketplace.router.js";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import { favoritesRouter } from "./router/favoritesRoutes.js";
import categoryRoutes from "./router/categoryRoutes.js"
import addressRoutes from "./router/addressRoutes.js"
import orderRoutes from "./router/orderRoutes.js";
import couponsRoutes from "./router/couponsRoutes.js";
import tranzilaRouter from "./router/tranzilaRouter.js";
import uploadRoutes from "./router/upload.routes.js";


import dotenv from 'dotenv';
import { productImportRouter } from "./router/productImport.router.js";

import zapFeedRoutes from "./router/zapFeedRoutes.js";




const app = express();

connectDB()
  .then(() => {
    console.log("✅ MongoDB connected");
  })
  .catch((err) => {
    console.error("❌ MongoDB connection failed", err);
    process.exit(1);
  });

// CORS middleware - must be before all other middleware
const corsOptions = {
  origin: [
    "http://localhost:5173",
    "http://localhost:5174",
    "https://affirmatively-unparenthesised-brandon.ngrok-free.dev",
    "https://express48.com",
    "https://express48.co.il",
    "https://www.express48.com",
    "https://www.express48.co.il",
    // ואם יש דומיין של CloudFront – גם אותו:
    "https://<הדומיין-של-CloudFront-אם-יש>"
  ],
  credentials: true,
  methods: ["GET", "PUT", "POST", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
};

app.use(cors(corsOptions));

// Middlewares
app.use(express.json());
app.set('trust proxy', 1);
app.use(apiLimiter);
app.use(cookieParser());
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: true,
}));
app.use("/search", searchRouter);
app.use(passport.initialize());
app.use(passport.session());
app.use("/", sitemapRouter); // חשוב לפני errorHandler

app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use((req, res, next) => {
  console.log("➡️ NEW REQUEST:", req.method, req.url);
  next();
});
// Routes
app.use('/entrance', entranceRouter);
app.use('/password', passwordRouter);
app.use('/contact', contactRouter);
app.use("/user", userRouter);
app.use("/auth", googleAuthRouter);
app.use("/marketplace", marketplaceRouter)
app.use("/seller-store", storeRouter)
app.use("/public/stores", storePublicRouter)
app.use("/seller/products", productImportRouter); // 👈 מוסיפים את זה

app.use('/cart', cartRouter);
// app.use('/products', productRoutes);
app.use('/products', productRouter);
app.use("/favorites", favoritesRouter);
app.use("/categories", categoryRoutes);
app.use("/addresses", addressRoutes);
app.use("/orders", orderRoutes);
app.use("/coupons", couponsRoutes);
app.use('/payments/tranzila', tranzilaRouter);
app.use("/uploads", uploadRoutes);
app.use("/seller/products", sellerProductsRouter);

app.use(errorHandler);
app.use("/", zapFeedRoutes);


const PORT = process.env.PORT || 8080;
dotenv.config();

app.listen(PORT, "0.0.0.0", () => {
  console.log(`start server port: ${PORT}`);
});

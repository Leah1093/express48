// import express from "express";
// import cors from 'cors';
// import cookieParser from 'cookie-parser';
// import path from "path";
// import { fileURLToPath } from "url";

// import { connectDB } from "./config/db.js";
// import 'dotenv/config';
// import { passwordRouter } from "./router/password.router.js";
// import { entranceRouter } from "./router/entrance.router.js";
// import { errorHandler } from "./middlewares/errorHandler.js";
// import { googleAuthRouter } from "./router/googleAuth.router.js";
// import { contactRouter } from "./router/contactRouter.js";
// import { userRouter } from "./router/user.routes.js";
// import { storeRouter } from "./router/store.router.js";
// import cartRouter from './router/cartRouter.js';
// import { storePublicRouter } from "./router/storePublic.router.js";
// import passport from "passport";
// import session from "express-session";
// import { apiLimiter } from "./middlewares/rateLimit.middleware.js";
// import './config/googleOAuth.config.js'
// import productRouter from "./router/product.router.js";
// import searchRouter from "./router/search.router.js";
// import { sellerProductsRouter } from "./router/seller.products.router.js";
// // import { sellerProfileRouter } from "./router/sellerProfile.router.js";
// import { marketplaceRouter } from "./router/marketplace.router.js";
// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

// import { favoritesRouter } from "./router/favoritesRoutes.js";
// import categoryRoutes from "./router/categoryRoutes.js"
// import addressRoutes from "./router/addressRoutes.js"
// import orderRoutes from "./router/orderRoutes.js";
// import couponsRoutes from "./router/couponsRoutes.js";
// import tranzilaRouter from "./router/tranzilaRouter.js";

// // import tranzilaRoutes from './router/tranzilaRoutes.js';

// const app = express();

// connectDB();
// app.use(cors({
//   origin: ["http://localhost:5173", 'https://affirmatively-unparenthesised-brandon.ngrok-free.dev'],
//   credentials: true,
//   methods: ["GET", "PUT", "POST", "PATCH", "DELETE", "OPTIONS"],
//   allowedHeaders: ["Content-Type", "Authorization"],
// }));

// // Middlewares
// app.use(express.json());
// app.set('trust proxy', 1);
// app.use(apiLimiter);
// app.use(cookieParser());
// app.use(session({
//   secret: process.env.SESSION_SECRET,
//   resave: false,
//   saveUninitialized: true,
// }));
// app.use("/api/search", searchRouter);
// app.use(passport.initialize());
// app.use(passport.session());

// app.get("/", (req, res) => {
//   res.send("Express48 API is running 🚀");
// });
// app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// // Routes
// app.use('/entrance', entranceRouter);
// app.use('/password', passwordRouter);
// app.use('/contact', contactRouter);
// app.use("/user", userRouter);
// app.use("/auth", googleAuthRouter);
// app.use("/marketplace", marketplaceRouter)
// app.use("/seller-store", storeRouter)
// app.use("/public/stores", storePublicRouter)
// app.use("/seller/products", sellerProductsRouter)
// app.use('/cart', cartRouter);
// // app.use('/products', productRoutes);
// app.use('/products', productRouter);
// app.use("/favorites", favoritesRouter);
// app.use("/categories", categoryRoutes);
// app.use("/addresses", addressRoutes);
// app.use("/orders", orderRoutes);
// app.use("/coupons", couponsRoutes);
// app.use('/payments/tranzila', tranzilaRouter);
// app.use(errorHandler);
// app.use('/payments/tranzila', tranzilaRouter);


// const PORT = process.env.PORT || 8080;

// app.listen(PORT, "0.0.0.0", () => {
//   console.log(`start server port: ${PORT}`);
// });


// app.js / server.js
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import path from "path";
import { fileURLToPath } from "url";
import session from "express-session";
import passport from "passport";
import "dotenv/config.js";

import { connectDB } from "./config/db.js";

import { passwordRouter } from "./router/password.router.js";
import { entranceRouter } from "./router/entrance.router.js";
import { googleAuthRouter } from "./router/googleAuth.router.js";
import { contactRouter } from "./router/contactRouter.js";
import { userRouter } from "./router/user.routes.js";
import { storeRouter } from "./router/store.router.js";
import cartRouter from "./router/cartRouter.js";
import { storePublicRouter } from "./router/storePublic.router.js";
import productRouter from "./router/product.router.js";
import searchRouter from "./router/search.router.js";
import { sellerProductsRouter } from "./router/seller.products.router.js";
import { marketplaceRouter } from "./router/marketplace.router.js";
import { favoritesRouter } from "./router/favoritesRoutes.js";
import categoryRoutes from "./router/categoryRoutes.js";
import addressRoutes from "./router/addressRoutes.js";
import orderRoutes from "./router/orderRoutes.js";
import couponsRoutes from "./router/couponsRoutes.js";
import tranzilaRouter from "./router/tranzilaRouter.js";

import { apiLimiter } from "./middlewares/rateLimit.middleware.js";
import { errorHandler } from "./middlewares/errorHandler.js";

import "./config/googleOAuth.config.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// DB
connectDB();

// CORS – תשאירי כי הפרונט ב־5173 והשרת ב־8080
app.use(
  cors({
    origin: ["http://localhost:5173"],
    credentials: true,
    methods: ["GET", "PUT", "POST", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());
app.set("trust proxy", 1);
app.use(apiLimiter);
app.use(cookieParser());

app.use(
  session({
    secret: process.env.SESSION_SECRET || "dev-secret",
    resave: false,
    saveUninitialized: true,
  })
);

app.use(passport.initialize());
app.use(passport.session());

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.get("/", (req, res) => {
  res.send("Express48 API is running 🚀");
});

// ----- ראוטים רגילים -----
app.use("/entrance", entranceRouter);
app.use("/password", passwordRouter);
app.use("/contact", contactRouter);
app.use("/user", userRouter);
app.use("/auth", googleAuthRouter);
app.use("/api/search", searchRouter);
app.use("/marketplace", marketplaceRouter);
app.use("/seller-store", storeRouter);
app.use("/public/stores", storePublicRouter);
app.use("/seller/products", sellerProductsRouter);
app.use("/products", productRouter);
app.use("/cart", cartRouter);
app.use("/favorites", favoritesRouter);
app.use("/categories", categoryRoutes);
app.use("/addresses", addressRoutes);
app.use("/orders", orderRoutes);
app.use("/coupons", couponsRoutes);

// ----- טרנזילה -----
app.use("/payments/tranzila", tranzilaRouter);

// error handler – תמיד בסוף
app.use(errorHandler);

const PORT = process.env.PORT || 8080;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`start server port: ${PORT}`);
});


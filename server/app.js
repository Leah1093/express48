import express from "express";
import cors from 'cors';
import cookieParser from 'cookie-parser';
import path from "path";
import { fileURLToPath } from "url";

import { connectDB } from "./config/db.js";
import 'dotenv/config';
import { passwordRouter } from "./router/pwd.router.js";
import { entranceRouter } from "./router/entrance.router.js";
import { errorHandler } from "./middlewares/errorHandler.js";
import { googleAuthRouter } from "./router/googleAuth.router.js";
import { contactRouter } from "./router/contactRouter.js";
import { userRouter } from "./router/user.routes.js";
import { storeRouter } from "./router/store.router.js";
import cartRouter from './router/cartRouter.js';
import productRoutes from "./router/productRoutes.js";
import { storePublicRouter } from "./router/storePublic.router.js";
import passport from "passport";
import session from "express-session";
import { apiLimiter } from "./middlewares/rateLimit.middleware.js";
import './config/googleOAuth.config.js'
// import { sellerProfileRouter } from "./router/sellerProfile.router.js";
import { marketplaceRouter } from "./router/marketplace.router.js";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import { favoritesRouter } from "./router/favoritesRoutes.js";
import categoryRoutes from "./router/categoryRoutes.js"
import addressRoutes from "./router/addressRoutes.js"
import orderRoutes from "./router/orderRoutes.js";

const app = express();

// Middlewares
connectDB();
app.use(express.json());
app.set('trust proxy', 1);
app.use(apiLimiter);
app.use(cookieParser());
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: true,
}));

app.use(passport.initialize());
app.use(passport.session());
app.use(cors({
  origin: 'http://localhost:5173', // או הדומיין שלך בפרודקשן
  credentials: true,
  methods: ["GET", "PUT", "POST", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Routes
app.use('/entrance', entranceRouter);
app.use('/password', passwordRouter);
app.use('/contact', contactRouter);
app.use("/user", userRouter);
app.use("/auth", googleAuthRouter);
app.use("/marketplace", marketplaceRouter)
app.use("/seller-store", storeRouter)
app.use("/public/stores", storePublicRouter)
app.use(errorHandler);

app.use('/cart', cartRouter);
app.use('/products', productRoutes);
app.use("/favorites", favoritesRouter);
app.use("/categories", categoryRoutes);
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));
app.use("/addresses", addressRoutes);
app.use("/orders", orderRoutes);

app.use(errorHandler);

app.listen(process.env.PORT, () => {
  console.log(`start server port: ${process.env.PORT}`);
});

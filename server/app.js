import express from "express";
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { connectDB } from "./config/db.js";
import 'dotenv/config';
import { passwordRouter } from "./router/pwdRouter.js";
import { entranceRouter } from "./router/entranceRouter.js";
import { errorHandler } from "./middlewares/errorHandler.js";
import { googleAuthRouter } from "./router/googleAuthRouter.js";
import { contactRouter } from "./router/contactRouter.js";
import { userRouter } from "./router/userRoutes.js";
import cartRouter from './router/cartRouter.js';
import productRoutes  from "./router/productRoutes.js";
import passport from "passport";
import session from "express-session";
import './config/googleOAuthConfig.js';
import { favoritesRouter } from "./router/favoritesRoutes.js";
import path from "path";
import categoryRoutes from "./router/categoryRoutes.js"

const app = express();

// Middlewares
connectDB();
app.use(express.json());
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
    credentials: true
}));

// Routes
app.use('/entrance', entranceRouter);
app.use('/password', passwordRouter);
app.use('/contact', contactRouter);
app.use("/user", userRouter);
app.use("/auth", googleAuthRouter);


app.use('/cart', cartRouter);
app.use('/products', productRoutes);
app.use("/favorites", favoritesRouter);
app.use("/categories", categoryRoutes);
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

app.use(errorHandler);


app.listen(process.env.PORT, () => {
    console.log(`start server port: ${process.env.PORT}`);
});

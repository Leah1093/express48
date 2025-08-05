// import express from "express";
// import cors from 'cors';
// import { connectDB } from "./config/db.js";
// import 'dotenv/config';
// import { passwordRouter } from "./router/pwdRouter.js";
// import { entranceRouter } from "./router/entranceRouter.js";
// import { errorHandler } from "./middlewares/errorHandler.js";
// import { contactRouter } from "./router/contactRouter.js";
// ;
// const app = express();

// // Middlewares
// connectDB();
// app.use(express.json());
// app.use(cors());
// // Routes
// app.use('/entrance',entranceRouter);
// app.use('/password',passwordRouter);
// app.use('/contact',contactRouter)
// app.use(errorHandler);

// app.listen(process.env.PORT, () => {
//     console.log(`start server port: ${process.env.PORT}`);
// })



import express from "express";
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { connectDB } from "./config/db.js";
import 'dotenv/config';
import { passwordRouter } from "./router/pwdRouter.js";
import { entranceRouter } from "./router/entranceRouter.js";
import { errorHandler } from "./middlewares/errorHandler.js";

import { contactRouter } from "./router/contactRouter.js";

import cartRouter from './router/cartRouter.js';
import productRoutes  from "./router/productRoutes.js";


const app = express();

// Middlewares
connectDB();
app.use(express.json());
app.use(cookieParser());
app.use(cors({
    origin: 'http://localhost:5173', // או הדומיין שלך בפרודקשן
    credentials: true
}));

// Routes
app.use('/entrance', entranceRouter);
app.use('/password', passwordRouter);
app.use('/contact', contactRouter);
app.use(errorHandler);

app.use('/cart', cartRouter);
app.use('/products', productRoutes);

app.listen(process.env.PORT, () => {
    console.log(`start server port: ${process.env.PORT}`);
});

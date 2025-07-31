import express from "express";
import cors from 'cors';
import { connectDB } from "./config/db.js";
import 'dotenv/config';
import { passwordRouter } from "./router/pwdRouter.js";
import { entranceRouter } from "./router/entranceRouter.js";
import { errorHandler } from "./middlewares/errorHandler.js"
;
const app = express();

// Middlewares
connectDB();
app.use(express.json());
app.use(cors());
// Routes
app.use('/entrance',entranceRouter);
app.use('/password',passwordRouter);
app.use(errorHandler);

app.listen(process.env.PORT, () => {
    console.log(`start server port: ${process.env.PORT}`);
})

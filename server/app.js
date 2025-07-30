import express, { query } from "express";
import cors from 'cors';
import 'dotenv/config';
import { entranceRouter } from "./router/entranceRouter";
import { errorHandler } from "./middlewares/errorHandler"
;
const app = express();

// Middlewares
app.use(express.json());
app.use(cors());


// Routes
app.use('/entrance',entranceRouter);
app.use(errorHandler);

app.listen(process.env.PORT, () => {
    console.log(`start server port: ${process.env.PORT}`);
})

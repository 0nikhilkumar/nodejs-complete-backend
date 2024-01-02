import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors"
import { LIMIT } from "./constants.js";
const app = express();

app.use(express.json({limit: LIMIT}));
app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
}));
app.use(express.urlencoded({extended: true, limit: LIMIT}));
app.use(express.static("public"));
app.use(cookieParser());

import userRouter from "./routes/user.routes.js"
import adminRouter from "./routes/admin.routes.js"

app.use("/api/v1/users", userRouter);
app.use("/api/v1/admin", adminRouter);

export { app };

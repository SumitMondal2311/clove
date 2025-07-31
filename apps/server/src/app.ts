export const startTime = new Date().getTime();

import cookieParser from "cookie-parser";
import cors from "cors";
import express, { NextFunction, Request, Response } from "express";
import helmet from "helmet";
import morgan from "morgan";
import { appRoutes } from "./app-routes.js";
import { ApiError } from "./configs/api-error.js";
import { env } from "./configs/env.js";

export const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(
    cors({
        origin: env.WEB_ORIGIN,
        credentials: true,
        methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    })
);

app.use(helmet());
app.use(morgan("dev"));

appRoutes(app);

app.use((err: ApiError, _req: Request, res: Response, _next: NextFunction) => {
    if (env.NODE_ENV === "production") {
        console.error(err.stack);
    }
    res.status(err.statusCode || 500).json({
        message: err.message || "Internal server error",
    });
});

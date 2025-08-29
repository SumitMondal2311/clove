export const startTime = new Date().getTime();

import cookieParser from "cookie-parser";
import cors from "cors";
import express, { NextFunction, Request, Response } from "express";
import helmet from "helmet";
import morgan from "morgan";
import { env } from "./configs/env.js";
import { router } from "./routes/index.js";
import { CloveError } from "./utils/clove-error.js";

export const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));

app.use(
    cors({
        origin: env.WEB_ORIGIN,
        credentials: true,
        methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    })
);

app.use(helmet());
app.use(cookieParser());

app.use("/api", router);

app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
    if (err instanceof CloveError) {
        console.error(err.details);
        return res.status(err.statusCode).json(err.toJSON());
    }

    console.error("Unexpected error: " + err);
    res.status(500).json({
        message: "Internal server error: something went wrong",
    });
});

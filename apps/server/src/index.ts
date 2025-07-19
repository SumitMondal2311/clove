export const startTime = new Date().getTime();

import cookieParser from "cookie-parser";
import cors from "cors";
import express, { NextFunction, Request, Response } from "express";
import helmet from "helmet";
import morgan from "morgan";
import { ApiError } from "./configs/api-error.js";
import { env } from "./configs/env.js";
import { connectDB, disconnectDB } from "./lib/prisma.js";
import { authRouter } from "./routes/auth.routes.js";

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

app.get("/health", (_req: Request, res: Response) => {
    res.status(200).json({
        message: "OK",
    });
});

app.use("/api/auth", authRouter);

app.use((err: ApiError, _req: Request, res: Response, _next: NextFunction) => {
    if (env.NODE_ENV === "production") {
        console.error(err.stack);
    }
    res.status(err.statusCode || 500).json({
        message: err.message || "Internal server error",
    });
});

const server = app.listen(env.PORT, async () => {
    console.log(`Ready in ${new Date().getTime() - startTime}ms`);
    console.log(`Server running on ${env.API_ORIGIN}`);
    await connectDB();
});

let shuttingDown = false;

["SIGTERM", "SIGINT"].forEach((signal) => {
    process.on(signal, async () => {
        if (shuttingDown) return;
        shuttingDown = true;
        await disconnectDB();
        server.close(() => {
            console.log("Server gracefully shut down");
            process.exit(0);
        });
    });
});

process.on("unhandledRejection", (error: Error) => {
    console.error(`Error unhandled rejection: ${error}`);
    process.exit();
});

process.on("uncaughtException", (error: Error) => {
    console.error(`Error uncaught exception: ${error}`);
    process.exit();
});

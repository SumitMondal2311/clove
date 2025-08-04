import { Request, Response, Router } from "express";
import { authRouter } from "./routes/auth-route.js";

export const appRouter = Router();

appRouter.get("/health", (_req: Request, res: Response) => {
    res.status(200).json({
        uptime: process.uptime(),
        message: "FINE",
    });
});

appRouter.use("/auth", authRouter);

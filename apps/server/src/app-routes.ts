import { Express, Request, Response } from "express";

export const appRoutes = (app: Express) => {
    app.get("/health", (_req: Request, res: Response) => {
        res.status(200).json({
            uptime: process.uptime(),
            message: "FINE",
        });
    });
};

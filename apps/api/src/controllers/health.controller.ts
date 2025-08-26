import { Request, Response } from "express";

export const healthController = (_req: Request, res: Response) => {
    res.status(200).json({
        uptime: process.uptime(),
        message: "OK",
    });
};

import { NextFunction, Request, Response } from "express";

export const handleAsync = (
    func: (req: Request, res: Response, next: NextFunction) => Promise<any>
) => {
    return (req: Request, res: Response, next: NextFunction) =>
        Promise.resolve(func(req, res, next)).catch(next);
};
